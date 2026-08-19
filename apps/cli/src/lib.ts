// Shared CLI helpers: env loading, engine construction, output formatting.

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { ResearchEngine, TavilyProvider, HtmlFetcher } from "@uae-intel/research";
import { openDb, migrate } from "@uae-intel/db";
import type { ResearchDepth } from "@uae-intel/core";
import type Database from "better-sqlite3";

export function loadEnv(path = ".env"): void {
  try {
    const content = readFileSync(resolve(process.cwd(), path), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional; env vars may be set in the shell.
  }
}

export function getEngine(): ResearchEngine {
  const search = new TavilyProvider();
  const fetcher = new HtmlFetcher();
  return new ResearchEngine(search, fetcher);
}

export function getDb(): Database.Database {
  const db = openDb({ path: process.env.DATABASE_URL });
  migrate(db);
  return db;
}

export function parseDepth(s?: string): ResearchDepth {
  const v = (s ?? "").toUpperCase();
  if (v === "QUICK" || v === "STANDARD" || v === "DEEP" || v === "DUE DILIGENCE") {
    return v;
  }
  return "STANDARD";
}

export function writeFile(path: string, content: string): void {
  writeFileSync(path, content, "utf8");
  console.log(`Report written to ${pathToFileURL(resolve(path)).href}`);
}
