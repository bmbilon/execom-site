// Staging import preserves existing UUIDs and password hashes; it never resets credentials.
import {Pool} from "pg";
import {getMigrations} from "better-auth/db/migration";
import {createPortalAuth} from "../lib/neon/auth-config";
if (!/^ep-late-dew-b79cr6v5(?:-pooler)?\./.test(new URL(process.env.PORTAL_DATABASE_URL!).hostname)) throw new Error("Unexpected migration database");
const pool = new Pool({connectionString:process.env.PORTAL_DATABASE_URL,options:"-c search_path=portal_auth",max:4,connectionTimeoutMillis:15000});
const auth = createPortalAuth(pool,async()=>{throw new Error("Email is forbidden during migration");},false);
async function main() {
 console.log("Migration mode",process.argv.includes("--apply")?"apply":"plan");
 const plan = await getMigrations(auth.options);
 if(plan.unsafeChanges.length || plan.schemaProblems.length) throw new Error("Unsafe auth schema migration");
 if(!process.argv.includes("--apply")) return;
 await plan.runMigrations();
 console.log("Schema ready; importing users");
 console.log("Pool before import",{ended:pool.ended,total:pool.totalCount,waiting:pool.waitingCount,idle:pool.idleCount});
 const db=await pool.connect();
 console.log("Import connection acquired");
 try {
  await db.query("BEGIN");
  const users=await db.query("SELECT id,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data FROM auth.users WHERE deleted_at IS NULL ORDER BY id");
  for(const user of users.rows) {
   if(!user.email) throw new Error("An account needs non-email auth support");
   await db.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',[user.id,user.raw_user_meta_data?.full_name ?? user.email.split("@")[0],user.email,Boolean(user.email_confirmed_at),user.created_at,user.updated_at ?? user.created_at]);
   if(user.encrypted_password) await db.query(`INSERT INTO account (id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES ($1::uuid,$1::text,'credential',$1::uuid,$2,$3,$4) ON CONFLICT(id) DO NOTHING`,[user.id,user.encrypted_password,user.created_at,user.updated_at ?? user.created_at]);
  }
  const verified=await db.query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE a.password=u.encrypted_password)::int AS matching FROM auth.users u LEFT JOIN portal_auth.account a ON a."userId"::text=u.id::text AND a."providerId"='credential' WHERE u.encrypted_password IS NOT NULL AND u.encrypted_password<>''`);
  if(verified.rows[0].total!==verified.rows[0].matching)throw new Error("Credential verification mismatch");
  await db.query("REVOKE ALL ON ALL TABLES IN SCHEMA portal_auth FROM PUBLIC,authenticated,anonymous,legacy_authenticated,service_role");
  await db.query("COMMIT");
  console.log(JSON.stringify({importedUsers:users.rowCount,passwordHashes:verified.rows[0],emailsSent:0}));
 } catch(error){await db.query("ROLLBACK");throw error;}finally{db.release();}
}
main().finally(()=>pool.end()).catch((error)=>{console.error("Auth migration failed:", error instanceof Error ? error.message : "unknown error");process.exitCode=1;});
