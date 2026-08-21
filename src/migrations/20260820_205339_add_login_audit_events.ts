import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "cms"."enum_audit_logs_action" ADD VALUE 'auth.login_failed' BEFORE 'admin.created';
  ALTER TYPE "cms"."enum_audit_logs_action" ADD VALUE 'admin.deleted' BEFORE 'post.created';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "cms"."audit_logs" WHERE "action" IN ('auth.login_failed', 'admin.deleted');
   ALTER TABLE "cms"."audit_logs" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "cms"."enum_audit_logs_action";
  CREATE TYPE "cms"."enum_audit_logs_action" AS ENUM('auth.login', 'admin.created', 'admin.updated', 'post.created', 'post.updated', 'post.published', 'post.unpublished', 'post.deleted', 'media.deleted');
  ALTER TABLE "cms"."audit_logs" ALTER COLUMN "action" SET DATA TYPE "cms"."enum_audit_logs_action" USING "action"::"cms"."enum_audit_logs_action";`)
}
