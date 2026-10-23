import { foundersPages, foundersPrivateOrigin, foundersPrivatePages } from './lib/site/founders-routes.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return foundersPrivatePages.map(page => ({
      source: `/founders/${page}`,
      destination: `${foundersPrivateOrigin}/founders/${page}`,
      permanent: false,
    }))
  },
  async rewrites() {
    return [
      { source: '/fanbrush', destination: '/fanbrush/index.html' },
      ...foundersPages.map(page => ({
        source: page.path,
        destination: `/founders/pages/${page.file}.html`,
      })),
    ]
  },
}

export default nextConfig
