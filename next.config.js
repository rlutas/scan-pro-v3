/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: true,
  },
  experimental: {
    // Remove appDir as it's no longer needed in Next.js 13+
  },
  output: 'standalone',
};

module.exports = nextConfig;
