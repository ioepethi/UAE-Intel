/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@uae-intel/core",
    "@uae-intel/db",
    "@uae-intel/report",
    "@uae-intel/research",
  ],
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // On edge runtime, better-sqlite3 (native module) cannot be bundled.
    // Stub it out — it's only used in local dev via @uae-intel/db/local,
    // which is dynamically imported and never reached on Cloudflare.
    if (isServer && nextRuntime === "edge") {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["better-sqlite3"] = false;
      config.resolve.alias["@uae-intel/db/local"] = false;
    }
    return config;
  },
};

export default nextConfig;
