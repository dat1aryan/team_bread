/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};

export default nextConfig;
