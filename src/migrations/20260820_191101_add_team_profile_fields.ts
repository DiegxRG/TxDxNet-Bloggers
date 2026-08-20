import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_admins_expertise_domains" AS ENUM('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11');
  CREATE TABLE "cms"."admins_expertise_domains" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "cms"."enum_admins_expertise_domains",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  ALTER TABLE "cms"."admins" ADD COLUMN "public_bio" varchar;
  ALTER TABLE "cms"."admins" ADD COLUMN "show_on_team" boolean DEFAULT true;
  ALTER TABLE "cms"."admins_expertise_domains" ADD CONSTRAINT "admins_expertise_domains_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_expertise_domains_order_idx" ON "cms"."admins_expertise_domains" USING btree ("order");
  CREATE INDEX "admins_expertise_domains_parent_idx" ON "cms"."admins_expertise_domains" USING btree ("parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."admins_expertise_domains" CASCADE;
  ALTER TABLE "cms"."admins" DROP COLUMN "public_bio";
  ALTER TABLE "cms"."admins" DROP COLUMN "show_on_team";
  DROP TYPE "cms"."enum_admins_expertise_domains";`)
}
