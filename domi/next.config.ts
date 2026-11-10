import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Lets a local production build run alongside `next dev` without clobbering its cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Hide Vercel's comment toolbar (the round button in the corner) on the shared demo.
  // The old guided-demo link (/demo) now just opens the app.
  async redirects() {
    return [{ source: "/demo", destination: "/explore", permanent: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "x-vercel-skip-toolbar", value: "1" }] }];
  },
};

export default nextConfig;
