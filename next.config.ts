import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'www.freepnglogos.com', 'https://cdn-icons-png.flaticon.com', 'https://cdn-icons-png.flaticon.com', 'cdn-icons-png.flaticon.com', 'i.ibb.co'],
  },
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
