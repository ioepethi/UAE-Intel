/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@uae-intel/core",
    "@uae-intel/db",
    "@uae-intel/report",
    "@uae-intel/research",
  ],
  // better-sqlite3 is a native module — don't bundle it on the server.
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
