import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable strict mode to reduce double-mounting in development
  webpack: (config, { dev, isServer }) => {
    // Only apply these optimizations in development mode
    if (dev) {
      // Reduce the frequency of HMR updates
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300, // Delay rebuilding after changes (ms)
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
