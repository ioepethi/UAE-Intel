// Unified async database client interface.
// Two implementations:
//   - BetterSqliteClient: wraps better-sqlite3 (local dev / CLI)
//   - D1Client:           wraps Cloudflare D1 (production on Pages)
// Both expose the same async API so repository code is runtime-agnostic.

export interface RunResult {
  meta: {
    last_row_id: number;
    changes: number;
  };
}

export interface Statement {
  bind(...values: unknown[]): Statement;
  all<T = Record<string, unknown>>(): Promise<T[]>;
  run<T = Record<string, unknown>>(): Promise<RunResult>;
  first<T = Record<string, unknown>>(): Promise<T | undefined>;
}

export interface DbClient {
  prepare(sql: string): Statement;
  exec(sql: string): Promise<void>;
}
