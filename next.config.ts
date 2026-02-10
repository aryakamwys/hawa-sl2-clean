import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for production (docker-compose.yml)
  // For development (docker-compose.dev.yml), output mode is ignored
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Enable Turbopack for faster development
  turbopack: process.env.NODE_ENV === 'development' ? {
    root: __dirname,
  } : undefined,

  // Webpack config for better hot reload (only for development)
  ...(process.env.NODE_ENV === 'development' ? {
    webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
      if (dev && !isServer) {
        config.watchOptions = {
          poll: 1000, // Check for changes every second
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  } : {}),
};

export default nextConfig;
