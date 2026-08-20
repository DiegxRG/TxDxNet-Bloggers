import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "idx_posts_status_published"
      ON "cms"."posts" ("published_at" DESC)
      WHERE "_status" = 'published';

    CREATE INDEX IF NOT EXISTS "idx_posts_featured_published"
      ON "cms"."posts" ("published_at" DESC)
      WHERE "_status" = 'published' AND "featured" = true;

    CREATE INDEX IF NOT EXISTS "idx_media_purpose_mime"
      ON "cms"."media" ("purpose", "mime_type");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "cms"."idx_posts_status_published";
    DROP INDEX IF EXISTS "cms"."idx_posts_featured_published";
    DROP INDEX IF EXISTS "cms"."idx_media_purpose_mime";
  `)
}
