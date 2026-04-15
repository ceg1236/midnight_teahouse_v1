/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/reservations', destination: '/', permanent: false },
      { source: '/invite', destination: '/', permanent: false },
      {
        source: '/events/erstwhere-04-26',
        destination: '/erstwhere',
        permanent: true,
      },
      {
        source: '/events/erstwhere-04-26/success',
        destination: '/erstwhere/success',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
