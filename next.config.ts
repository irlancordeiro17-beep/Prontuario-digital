import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript strict checks during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prisma needs these for serverless
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default nextConfig;
