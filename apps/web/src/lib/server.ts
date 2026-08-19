// Server-side DB helper for the web app.
// On Cloudflare Pages: uses the D1 binding via getRequestContext() from @cloudflare/next-on-pages.
// Locally: opens a better-sqlite3 connection using eval(require) to hide the
// native module from both webpack and esbuild bundlers.

import { openD1, migrate } from "@uae-intel/db";
import type { DbClient } from "@uae-intel/db";

interface CloudflareEnv {
  UAE_INTEL_DB?: unknown;
}

let _localDb: DbClient | null = null;

async function getCloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const mod = await import("@cloudflare/next-on-pages");
    if (typeof mod.getRequestContext === "function") {
      return mod.getRequestContext().env as CloudflareEnv;
    }
  } catch {
    // Not on Cloudflare (local dev) — fall through to better-sqlite3.
  }
  return null;
}

// Inline the better-sqlite3 wrapper for local dev.
// Uses eval(require) so bundlers can't trace the native module.
function openLocalDb(path?: string): DbClient {
  const Database = eval("require")("better-sqlite3");
  const { resolve } = eval("require")("node:path");
  const dbPath = path ?? resolve(process.cwd(), "uae-intel.sqlite");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      let bound = stmt;
      return {
        bind(...values: unknown[]) {
          bound = stmt.bind(...values);
          return this;
        },
        async all() {
          return bound.all();
        },
        async run() {
          const r = bound.run();
          return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } };
        },
        async first() {
          return bound.get();
        },
      };
    },
    async exec(sql: string) {
      db.exec(sql);
    },
  };
}

export async function getDb(): Promise<DbClient> {
  const cfEnv = await getCloudflareEnv();
  if (cfEnv?.UAE_INTEL_DB) {
    return openD1(cfEnv.UAE_INTEL_DB as never);
  }
  // Local dev only — never reached on Cloudflare edge runtime.
  if (!_localDb) {
    _localDb = openLocalDb(process.env.DATABASE_URL);
    await migrate(_localDb);
  }
  return _localDb;
}

export async function closeDb(): Promise<void> {
  _localDb = null;
}

/**
 * Returns a function to schedule background work that must not block the
 * HTTP response — e.g. persisting discovery results to the DB. On Cloudflare
 * this uses the platform's ExecutionContext.waitUntil so the worker isn't
 * killed before the promise settles. Locally it's just fire-and-forget.
 */
export async function getWaitUntil(): Promise<(p: Promise<unknown>) => void> {
  try {
    const mod = await import("@cloudflare/next-on-pages");
    if (typeof mod.getRequestContext === "function") {
      const ctx = mod.getRequestContext().ctx as { waitUntil?: (p: Promise<unknown>) => void };
      if (ctx?.waitUntil) {
        return (p: Promise<unknown>) => ctx.waitUntil!(p.catch(() => undefined));
      }
    }
  } catch {
    // Not on Cloudflare — fall through.
  }
  return (p: Promise<unknown>) => {
    p.catch(() => undefined);
  };
}
