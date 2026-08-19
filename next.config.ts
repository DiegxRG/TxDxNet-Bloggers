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
      { pathname: '/logo_blanco.png' },
      { pathname: '/Google_Play_2022_icon.svg.webp' },
      { pathname: '/App_Store_*.svg.webp' },
      { pathname: '/domains/**' },
      { pathname: '/prompt*.png' },
      { pathname: '/service*.png' },
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

export default withPayload(nextConfig, { devBundleServerPackages: false })
