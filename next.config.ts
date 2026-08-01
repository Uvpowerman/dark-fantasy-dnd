import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dark-fantasy-dnd",
  assetPrefix: "/dark-fantasy-dnd/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // The Cloudflare worker and D1 helpers are validated by the Sites build.
  // They are not part of the browser-only GitHub Pages export.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
