import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_admins_role" AS ENUM('owner', 'editor');
  CREATE TYPE "cms"."enum_audit_logs_action" AS ENUM('auth.login', 'admin.created', 'admin.updated', 'post.created', 'post.updated', 'post.published', 'post.unpublished', 'post.deleted', 'media.deleted');
  CREATE TABLE "cms"."audit_logs" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"action" "cms"."enum_audit_logs_action" NOT NULL,
  	"actor_id" uuid,
  	"actor_email" varchar NOT NULL,
  	"target_collection" varchar,
  	"target_i_d" varchar,
  	"summary" varchar NOT NULL,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
   ALTER TABLE "cms"."admins" ADD COLUMN "role" "cms"."enum_admins_role" DEFAULT 'editor';
   ALTER TABLE "cms"."admins" ADD COLUMN "is_active" boolean DEFAULT true;
   ALTER TABLE "cms"."admins" ADD COLUMN "must_change_password" boolean DEFAULT true;
   UPDATE "cms"."admins"
   SET
     "role" = CASE
       WHEN lower("email") IN ('diego.ramos@txdxsecure.com', 'rolando.ricapa@txdxsecure.com') THEN 'owner'::"cms"."enum_admins_role"
       ELSE 'editor'::"cms"."enum_admins_role"
     END,
     "is_active" = lower("email") IN (
       'angelo.garcia@txdxsecure.com',
       'cristhian.morillo@txdxsecure.com',
       'steve.ricapa@txdxsecure.com',
       'rolando.ricapa@txdxsecure.com',
       'carla.ricapa@txdxsecure.com',
       'diego.ramos@txdxsecure.com',
       'anthony.callirgos@txdxsecure.com',
       'michael.caceres@txdxsecure.com',
       'ralph.ricapa@txdxsecure.com'
     ),
     "must_change_password" = false;
   CREATE INDEX "admins_role_idx" ON "cms"."admins" USING btree ("role");
   CREATE INDEX "admins_is_active_idx" ON "cms"."admins" USING btree ("is_active");
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD COLUMN "audit_logs_id" uuid;
  ALTER TABLE "cms"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_admins_id_fk" FOREIGN KEY ("actor_id") REFERENCES "cms"."admins"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "audit_logs_actor_idx" ON "cms"."audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "cms"."audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "cms"."audit_logs" USING btree ("created_at");
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "cms"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("audit_logs_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "cms"."payload_locked_documents_rels_audit_logs_id_idx";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP COLUMN "audit_logs_id";
   ALTER TABLE "cms"."audit_logs" DISABLE ROW LEVEL SECURITY;
   DROP TABLE "cms"."audit_logs" CASCADE;
   DROP INDEX "cms"."admins_role_idx";
   DROP INDEX "cms"."admins_is_active_idx";
   ALTER TABLE "cms"."admins" DROP COLUMN "role";
   ALTER TABLE "cms"."admins" DROP COLUMN "is_active";
   ALTER TABLE "cms"."admins" DROP COLUMN "must_change_password";
   DROP TYPE "cms"."enum_admins_role";
   DROP TYPE "cms"."enum_audit_logs_action";`)
}
