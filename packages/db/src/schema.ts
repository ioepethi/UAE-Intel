// SQLite schema for the UAE Intelligence system.
// Mirrors §11 DATABASE STRUCTURE of the master prompt.
// Schema SQL is shared between better-sqlite3 (local) and Cloudflare D1 (production).
// NOTE: This file must NOT import better-sqlite3 — it's used on edge runtime too.

import type { DbClient } from "./client.js";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  name_variations TEXT NOT NULL DEFAULT '[]',
  current_title TEXT,
  location TEXT,
  linkedin_url TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  website TEXT,
  domain TEXT,
  industry TEXT,
  emirate TEXT,
  location TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  reliability TEXT NOT NULL,
  date_accessed TEXT NOT NULL,
  confirms TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  confidence INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'public',
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  verification TEXT NOT NULL DEFAULT 'UNKNOWN',
  confidence INTEGER NOT NULL DEFAULT 0,
  last_verified TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (person_id IS NOT NULL OR company_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  related_person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
  related_company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  confidence INTEGER NOT NULL DEFAULT 0,
  CHECK (related_person_id IS NOT NULL OR related_company_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_persons_name_lower ON persons(lower(full_name));
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies(lower(legal_name));
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_roles_person ON roles(person_id);
CREATE INDEX IF NOT EXISTS idx_roles_company ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_person ON contacts(person_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person ON relationships(person_id);
`;

export async function migrate(db: DbClient): Promise<void> {
  // D1's exec() does not support multiple statements separated by newlines
  // in all versions; split on semicolons and run each statement individually.
  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await db.exec(stmt + ";");
  }
}
