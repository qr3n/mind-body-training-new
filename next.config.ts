import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: false,
    images: {
        domains: ['http://79.174.82.90', '79.174.82.90', 'localhost:8000', 'http://localhost:8000', 'localhost']
    }
};

export default nextConfig;
