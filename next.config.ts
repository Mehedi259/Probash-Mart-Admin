import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://46.225.103.236:8003'}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
