import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@decks/core"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
