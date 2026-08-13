import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/logotxdx.png' },
      { pathname: '/Logo_XOC_Vectorial.png' },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qfwekssxqjweujyijyyo.storage.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
