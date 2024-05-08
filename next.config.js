/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["files.edgestore.dev"],
  },
};

module.exports = nextConfig;
