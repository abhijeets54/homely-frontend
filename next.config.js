/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'source.unsplash.com',
      'images.unsplash.com',
      'localhost',
      'res.cloudinary.com',
      't3.ftcdn.net' // Added this line
    ],
  },
  experimental: {
    serverActions: {
      enabled: true  // Changed from boolean to object
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
