/** @type {import('next').NextConfig} */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  basePath,
  async rewrites() {
    const bffBaseUrl = (process.env.BFF_BASE_URL || 'http://localhost:8001').replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${bffBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
