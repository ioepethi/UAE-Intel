// Local-only entry point for better-sqlite3 access.
// Import from "@uae-intel/db/local" — never bundled on edge runtime.
export { openBetterSqlite } from "./better-sqlite.js";
export type { BetterSqliteOptions } from "./better-sqlite.js";
export { migrate, SCHEMA_SQL } from "./schema.js";
export type { DbClient } from "./client.js";
