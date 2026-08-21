import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_analytics_events_type" AS ENUM('page_view', 'article_read');
  CREATE TABLE "cms"."analytics_events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"type" "cms"."enum_analytics_events_type" NOT NULL,
  	"path" varchar NOT NULL,
  	"day" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."analytics_visitors" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"day" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD COLUMN "analytics_events_id" uuid;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD COLUMN "analytics_visitors_id" uuid;
  CREATE INDEX "analytics_events_day_idx" ON "cms"."analytics_events" USING btree ("day");
  CREATE INDEX "analytics_events_updated_at_idx" ON "cms"."analytics_events" USING btree ("updated_at");
  CREATE INDEX "analytics_events_created_at_idx" ON "cms"."analytics_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "analytics_visitors_key_idx" ON "cms"."analytics_visitors" USING btree ("key");
  CREATE INDEX "analytics_visitors_day_idx" ON "cms"."analytics_visitors" USING btree ("day");
  CREATE INDEX "analytics_visitors_updated_at_idx" ON "cms"."analytics_visitors" USING btree ("updated_at");
  CREATE INDEX "analytics_visitors_created_at_idx" ON "cms"."analytics_visitors" USING btree ("created_at");
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "cms"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_visitors_fk" FOREIGN KEY ("analytics_visitors_id") REFERENCES "cms"."analytics_visitors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_visitors_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("analytics_visitors_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "cms"."payload_locked_documents_rels_analytics_events_id_idx";
   DROP INDEX "cms"."payload_locked_documents_rels_analytics_visitors_id_idx";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP COLUMN "analytics_events_id";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP COLUMN "analytics_visitors_id";
   ALTER TABLE "cms"."analytics_events" DISABLE ROW LEVEL SECURITY;
   ALTER TABLE "cms"."analytics_visitors" DISABLE ROW LEVEL SECURITY;
   DROP TABLE "cms"."analytics_events" CASCADE;
   DROP TABLE "cms"."analytics_visitors" CASCADE;
   DROP TYPE "cms"."enum_analytics_events_type";`)
}
