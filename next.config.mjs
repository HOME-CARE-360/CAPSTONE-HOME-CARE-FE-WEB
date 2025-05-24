/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't run ESLint during builds
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'storage.googleapis.com',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'i.pinimg.com',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'example.com',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'cdn.example.com',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'loremflickr.com',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'picsum.photos',
        protocol: 'https',
        pathname: '/**',
      },
      {
        hostname: 'flagcdn.com',
        protocol: 'https',
        pathname: '/**',
      },
    ],
    // Optimize image loading and caching
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    // Increase the timeout for image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
