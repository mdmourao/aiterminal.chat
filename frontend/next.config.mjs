/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.API_BASE_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
