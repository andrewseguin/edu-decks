/** @type {import('next').NextConfig} */
const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  transpilePackages: ["@decks/core"],
  distDir: isVercel ? ".next" : (isProd ? ".next-prod" : ".next"),
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
