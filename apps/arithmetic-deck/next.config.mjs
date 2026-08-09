/** @type {import('next').NextConfig} */
const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === "production";

const isMobile = Boolean(process.env.MOBILE_BUILD);

const nextConfig = {
  transpilePackages: ["@decks/core"],
  output: isMobile ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath: isMobile ? "" : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  devIndicators: false,
};

export default nextConfig;
