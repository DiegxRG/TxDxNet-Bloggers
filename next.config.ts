import bundleAnalyzer from '@next/bundle-analyzer'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const configuredBuildCpus = Number.parseInt(process.env.NEXT_BUILD_CPUS || '', 10)
const buildCpus = Number.isInteger(configuredBuildCpus) && configuredBuildCpus > 0 ? configuredBuildCpus : 2
const configuredStaticGenerationConcurrency = Number.parseInt(process.env.NEXT_BUILD_PAGE_CONCURRENCY || '', 10)
const staticGenerationConcurrency = Number.isInteger(configuredStaticGenerationConcurrency) && configuredStaticGenerationConcurrency > 0
  ? configuredStaticGenerationConcurrency
  : 1

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    cpus: buildCpus,
    staticGenerationMaxConcurrency: staticGenerationConcurrency,
    // Payload-backed routes are intentionally dynamic; validate Instant UI only
    // on segments that explicitly opt in with `instant`.
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },
  poweredByHeader: false,
  serverExternalPackages: ['pdfkit', 'sharp'],
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/logotxdx.png' },
      { pathname: '/Logo_XOC_Vectorial.png' },
      { pathname: '/logo_blanco.png' },
      { pathname: '/Google_Play_2022_icon.svg.webp' },
      { pathname: '/App_Store_*.svg.webp' },
      { pathname: '/domains/**' },
      { pathname: '/prompt*.png' },
      { pathname: '/equipotxdxsecure.png' },
      { pathname: '/Designer__19_-removebg-preview.png' },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'txdxnet.com',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'www.txdxnet.com',
        pathname: '/api/media/file/**',
      },
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

export default withBundleAnalyzer(withPayload(nextConfig, { devBundleServerPackages: false }))
