import "server-only";
import { Pool } from "pg";
import { createPortalAuth } from "./auth-config";

let pool: Pool | undefined;
let auth: ReturnType<typeof createPortalAuth> | undefined;
export function getPortalPool() {
  if (!process.env.PORTAL_DATABASE_URL) throw new Error("Missing portal database configuration");
  const url=new URL(process.env.PORTAL_DATABASE_URL);
  if(!/^ep-late-dew-b79cr6v5(?:-pooler)?\./.test(url.hostname) || !url.hostname.endsWith(".neon.tech")) throw new Error("Unexpected portal database");
  url.searchParams.set("sslmode","verify-full");
  return pool ??= new Pool({connectionString:url.toString(), max:3, options:"-c search_path=portal_auth", connectionTimeoutMillis:15000});
}
export async function sendPortalEmail(to: string, subject: string, text: string) {
  if (!process.env.PORTAL_RESEND_API_KEY || !process.env.PORTAL_MAIL_FROM) throw new Error("Portal email is not configured");
  const response = await fetch("https://api.resend.com/emails", {method:"POST", headers:{Authorization:`Bearer ${process.env.PORTAL_RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.PORTAL_MAIL_FROM,to:[to],subject,text})});
  if (!response.ok) throw new Error("Portal email delivery failed");
}
export function getPortalAuth() { return auth ??= createPortalAuth(getPortalPool(),sendPortalEmail); }

export async function getPortalUser(requestHeaders: Headers) {
  const session = await getPortalAuth().api.getSession({headers:requestHeaders});
  if(!session) return null;
  const result=await getPortalPool().query(`SELECT p.id FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE p.id=$1 AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<now())`,[session.user.id]);
  return result.rowCount ? session.user : null;
}
