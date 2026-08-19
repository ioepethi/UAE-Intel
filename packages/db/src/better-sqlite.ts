// better-sqlite3 wrapper that adapts the sync API to the async DbClient interface.
// Used for local development and the CLI. Not loaded on Cloudflare (no native module).

import Database from "better-sqlite3";
import { resolve } from "node:path";
import type { DbClient, RunResult, Statement } from "./client.js";

export interface BetterSqliteOptions {
  path?: string;
  verbose?: boolean;
}

export function openBetterSqlite(opts: BetterSqliteOptions = {}): DbClient {
  const path = opts.path ?? resolve(process.cwd(), "uae-intel.sqlite");
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  if (opts.verbose) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).on("trace", (sql: string) => console.debug("[sql]", sql));
  }
  return new BetterSqliteClient(db);
}

class BetterSqliteClient implements DbClient {
  constructor(private readonly db: Database.Database) { }

  prepare(sql: string): Statement {
    const stmt = this.db.prepare(sql);
    return new BetterSqliteStatement(stmt);
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
}

class BetterSqliteStatement implements Statement {
  private bound: Database.Statement;
  private boundValues: unknown[] = [];

  constructor(private readonly stmt: Database.Statement) {
    this.bound = stmt;
  }

  bind(...values: unknown[]): Statement {
    this.boundValues = values;
    this.bound = this.stmt.bind(...values);
    return this;
  }

  async all<T = Record<string, unknown>>(): Promise<T[]> {
    return this.bound.all() as T[];
  }

  async run<T = Record<string, unknown>>(): Promise<RunResult> {
    const r = this.bound.run();
    return {
      meta: {
        last_row_id: Number(r.lastInsertRowid),
        changes: r.changes,
      },
    };
  }

  async first<T = Record<string, unknown>>(): Promise<T | undefined> {
    return this.bound.get() as T | undefined;
  }
}
