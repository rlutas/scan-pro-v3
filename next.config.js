/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-domain.com'], // Add your image domains here
  },
  experimental: {
    // Remove webassembly option as it's no longer needed
    // Modern Next.js versions handle WebAssembly modules automatically
    appDir: true,
  },
  webpack(config) {
    // Add WebAssembly support through webpack configuration instead
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
