/** @type {import('next').NextConfig} */
const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === "production";

const isMobile = Boolean(process.env.MOBILE_BUILD);

const nextConfig = {
  transpilePackages: ["@decks/core"],
  distDir: isMobile ? undefined : (isVercel ? ".next" : (isProd ? ".next-prod" : ".next")),
  output: isMobile ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath: isMobile ? "" : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
};

export default nextConfig;
