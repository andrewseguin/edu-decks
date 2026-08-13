/** @type {import('next').NextConfig} */
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
