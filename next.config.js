/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'profiles.utdallas.edu',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;
