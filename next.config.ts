import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  // ─── Webpack config (Turbopack has React 19 compat bug in Next 16.1.3) ───
  // modern-face-api imports `node:fs` which webpack can't resolve in client bundles.
  // Fallback to empty modules for Node.js built-ins in client-side code.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side: Node.js built-ins are not available.
      // Map them to empty modules (modern-face-api only uses fs in server paths).
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        os: false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
      }
      // Ignore modern-face-api's node:fs imports in client build
      config.module = config.module || {}
      config.module.exprContextCritical = false
      // Mark modern-face-api as external in client build (it's only used in verify flow)
      // This prevents webpack from trying to bundle node:fs imports
      config.externals = config.externals || []
      config.externals.push({
        'modern-face-api': 'modern-face-api',
      })
    }
    return config
  },
};

export default nextConfig;
