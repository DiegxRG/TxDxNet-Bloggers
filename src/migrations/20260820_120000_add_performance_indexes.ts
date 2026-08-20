import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_status_published
      ON "cms"."posts" ("_status", "publishedAt" DESC)
      WHERE "_status" = 'published';

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_cover_image
      ON "cms"."posts" ("coverImage");

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_avatar
      ON "cms"."posts" ("authorAvatar");

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_by
      ON "cms"."posts" ("createdBy");

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_featured_published
      ON "cms"."posts" ("featured", "publishedAt" DESC)
      WHERE "_status" = 'published' AND "featured" = true;

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_purpose_mime
      ON "cms"."media" ("purpose", "mimeType");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "cms"."idx_posts_status_published";
    DROP INDEX IF EXISTS "cms"."idx_posts_cover_image";
    DROP INDEX IF EXISTS "cms"."idx_posts_author_avatar";
    DROP INDEX IF EXISTS "cms"."idx_posts_created_by";
    DROP INDEX IF EXISTS "cms"."idx_posts_featured_published";
    DROP INDEX IF EXISTS "cms"."idx_media_purpose_mime";
  `)
}
