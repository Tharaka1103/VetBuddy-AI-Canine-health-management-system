import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Suppress punycode deprecation warning from mongoose */
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
