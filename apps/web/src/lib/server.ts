// Server-side helpers for the web app.
// Opens a DB connection per request (SQLite is fast for local use).

import { openDb, migrate } from "@uae-intel/db";
import type Database from "better-sqlite3";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = openDb({ path: process.env.DATABASE_URL });
    migrate(_db);
  }
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
