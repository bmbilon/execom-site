import { betterAuth } from "better-auth";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { nextCookies } from "better-auth/next-js";
import { compare } from "bcryptjs";
import { Pool } from "pg";

export function createPortalAuth(pool: Pool, sendEmail: (to: string, subject: string, text: string) => Promise<void>, withNextCookies = true) {
  const origin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BETTER_AUTH_URL;
  if (!origin || !process.env.BETTER_AUTH_SECRET) throw new Error("Missing portal auth configuration");
  return betterAuth({
    appName: "execom portal", baseURL: origin, basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    database: pool, trustedOrigins: [origin],
    advanced: { ipAddress: { ipAddressHeaders: ["x-forwarded-for"] }, database: { generateId: "uuid" }, cookiePrefix: "execom", useSecureCookies: origin.startsWith("https:") },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60,
      customRules: { "/sign-in/email": { window: 60, max: 5 }, "/request-password-reset": { window: 60, max: 3 } } },
    emailAndPassword: {
      enabled: true, disableSignUp: false, requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      password: {
        hash: hashPassword,
        verify: async ({hash,password}) => /^\$2[aby]\$/.test(hash)
          ? compare(password, hash.replace(/^\$2y\$/, "$2b$")) : verifyPassword({hash,password}),
      },
      sendResetPassword: async ({user,url}) => sendEmail(user.email, "Set your execom portal password", `Use this link to set your portal password:\n\n${url}\n\nThis link expires in one hour. If you did not request it, you can ignore this email.`),
      onPasswordReset: async ({user}) => { await pool.query('UPDATE "user" SET "emailVerified"=true WHERE id=$1',[user.id]); },
    },
    emailVerification: {
      sendOnSignUp: true, autoSignInAfterVerification: true,
      sendVerificationEmail: async ({user,url}) => sendEmail(user.email,"Confirm your execom account",`Confirm your email to activate your account:\n\n${url}\n\nIf you did not create this account, ignore this email.`),
    },
    databaseHooks: { session: { create: { before: async (session) => {
      const result=await pool.query('SELECT p.id,u.banned_until FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE p.id=$1 AND u.deleted_at IS NULL',[session.userId]);
      if(!result.rowCount || (result.rows[0].banned_until && new Date(result.rows[0].banned_until).getTime()>Date.now())) return false;
      return {data:session};
    } } } },
    plugins: withNextCookies ? [nextCookies()] : [],
  });
}
