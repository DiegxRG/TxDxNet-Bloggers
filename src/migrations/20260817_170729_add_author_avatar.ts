import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."admins" ADD COLUMN "avatar_id" uuid;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_url" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_width" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_height" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_mime_type" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_filesize" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "sizes_avatar_filename" varchar;
  ALTER TABLE "cms"."posts" ADD COLUMN "author_avatar_id" uuid;
  ALTER TABLE "cms"."_posts_v" ADD COLUMN "version_author_avatar_id" uuid;
  ALTER TABLE "cms"."admins" ADD CONSTRAINT "admins_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."posts" ADD CONSTRAINT "posts_author_avatar_id_media_id_fk" FOREIGN KEY ("author_avatar_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_posts_v" ADD CONSTRAINT "_posts_v_version_author_avatar_id_media_id_fk" FOREIGN KEY ("version_author_avatar_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admins_avatar_idx" ON "cms"."admins" USING btree ("avatar_id");
  CREATE INDEX "media_sizes_avatar_sizes_avatar_filename_idx" ON "cms"."media" USING btree ("sizes_avatar_filename");
  CREATE INDEX "posts_author_avatar_idx" ON "cms"."posts" USING btree ("author_avatar_id");
  CREATE INDEX "_posts_v_version_version_author_avatar_idx" ON "cms"."_posts_v" USING btree ("version_author_avatar_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."admins" DROP CONSTRAINT "admins_avatar_id_media_id_fk";
  
  ALTER TABLE "cms"."posts" DROP CONSTRAINT "posts_author_avatar_id_media_id_fk";
  
  ALTER TABLE "cms"."_posts_v" DROP CONSTRAINT "_posts_v_version_author_avatar_id_media_id_fk";
  
  DROP INDEX "cms"."admins_avatar_idx";
  DROP INDEX "cms"."media_sizes_avatar_sizes_avatar_filename_idx";
  DROP INDEX "cms"."posts_author_avatar_idx";
  DROP INDEX "cms"."_posts_v_version_version_author_avatar_idx";
  ALTER TABLE "cms"."admins" DROP COLUMN "avatar_id";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_url";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_width";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_height";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_mime_type";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_filesize";
  ALTER TABLE "cms"."media" DROP COLUMN "sizes_avatar_filename";
  ALTER TABLE "cms"."posts" DROP COLUMN "author_avatar_id";
  ALTER TABLE "cms"."_posts_v" DROP COLUMN "version_author_avatar_id";`)
}
