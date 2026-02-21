/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // Static export for Netlify
  images: { unoptimized: true }, // Required for static export
  trailingSlash: true,
  // Disable server-side features for static export
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
