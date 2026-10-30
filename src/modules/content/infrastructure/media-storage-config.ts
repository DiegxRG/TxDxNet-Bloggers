// Shared by Payload and the server-side PDF reader. Never import into client code.
export const EDITORIAL_STORAGE_PREFIX = 'editorial'

export function getMediaStorageConfig() {
  const endpoint = process.env.S3_ENDPOINT
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const bucket = process.env.S3_BUCKET
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null

  return {
    bucket,
    config: {
      endpoint,
      forcePathStyle: true,
      region: process.env.S3_REGION || 'ca-central-1',
      credentials: { accessKeyId, secretAccessKey },
    },
  }
}
