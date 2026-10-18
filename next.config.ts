import type { NextConfig } from "next";

// Static export: the same build is served on the web and wrapped by Capacitor for the app stores.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
