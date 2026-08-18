import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_media_purpose" AS ENUM('editorial', 'avatar');
  ALTER TABLE "cms"."media" ADD COLUMN "purpose" "cms"."enum_media_purpose" DEFAULT 'editorial';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."media" DROP COLUMN "purpose";
  DROP TYPE "cms"."enum_media_purpose";`)
}
