import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { createArticlePdfHandler } from '@/modules/content/infrastructure/pdf/article-pdf-handler'
import { createPayloadArticleImages } from '@/modules/content/infrastructure/pdf/article-images'
import { formatArticleDate, getPublishedPostBySlug } from '@/modules/content/infrastructure/payload/posts'

export const GET = createArticlePdfHandler({
  getPost: getPublishedPostBySlug,
  formatDate: formatArticleDate,
  createImages: async (signal, deadline) => {
    const payload = await getPayload({ config: await configPromise })
    return createPayloadArticleImages(payload, signal, deadline)
  },
})
