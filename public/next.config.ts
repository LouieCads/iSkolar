import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/platform/:path*',
        destination: 'http://localhost:5000/platform/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:5000/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
