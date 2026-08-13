import type { MetadataRoute } from 'next'

import { getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts(100)

  return [
    { url: siteURL, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteURL}/dominios`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteURL}/servicios`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteURL}/articulos`, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((post) => ({
      url: `${siteURL}/articulos/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.8 : 0.7,
    })),
  ]
}
