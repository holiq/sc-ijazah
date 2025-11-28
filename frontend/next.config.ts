import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/sc-ijazah",
  assetPrefix: "/sc-ijazah/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
