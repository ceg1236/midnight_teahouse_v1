/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/reservations', destination: '/', permanent: false },
      { source: '/invite', destination: '/', permanent: false },
    ]
  },
}

module.exports = nextConfig
