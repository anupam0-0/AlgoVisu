/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ["images.unsplash.com"],
    // optional alternative (more flexible):
    // remotePatterns: [
    //   { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    // ],
}
}
module.exports = nextConfig