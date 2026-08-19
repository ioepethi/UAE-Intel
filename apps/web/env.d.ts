// Cloudflare Pages bindings type declarations.
// Ensures getRequestContext().env is typed correctly.

interface CloudflareEnv {
  UAE_INTEL_DB: D1Database;
  TAVILY_API_KEY: string;
}

declare global {
  interface ProcessEnv {
    TAVILY_API_KEY?: string;
  }
}

export {};
