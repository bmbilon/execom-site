/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/fanbrush', destination: '/fanbrush/index.html' },
    ]
  },
}

export default nextConfig
