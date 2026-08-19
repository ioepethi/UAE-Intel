// Cloudflare D1 wrapper that adapts the D1 API to the unified async DbClient interface.
// Used in production on Cloudflare Pages. The D1Database is injected via env binding.

import type { DbClient, RunResult, Statement } from "./client.js";

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      run<T = Record<string, unknown>>(): Promise<{ meta: { last_row_id: number; changes: number } }>;
      first<T = Record<string, unknown>>(): Promise<T | null>;
    };
  };
  exec(sql: string): Promise<unknown>;
}

export function openD1(d1: D1Like): DbClient {
  return new D1Client(d1);
}

class D1Client implements DbClient {
  constructor(private readonly d1: D1Like) {}

  prepare(sql: string): Statement {
    return new D1Statement(this.d1, sql);
  }

  async exec(sql: string): Promise<void> {
    await this.d1.exec(sql);
  }
}

class D1Statement implements Statement {
  private boundValues: unknown[] = [];

  constructor(private readonly d1: D1Like, private readonly sql: string) {}

  bind(...values: unknown[]): Statement {
    this.boundValues = values;
    return this;
  }

  async all<T = Record<string, unknown>>(): Promise<T[]> {
    const stmt = this.d1.prepare(this.sql).bind(...this.boundValues);
    const res = await stmt.all<T>();
    return res.results ?? [];
  }

  async run<T = Record<string, unknown>>(): Promise<RunResult> {
    const stmt = this.d1.prepare(this.sql).bind(...this.boundValues);
    const res = await stmt.run<T>();
    return {
      meta: {
        last_row_id: res.meta?.last_row_id ?? 0,
        changes: res.meta?.changes ?? 0,
      },
    };
  }

  async first<T = Record<string, unknown>>(): Promise<T | undefined> {
    const stmt = this.d1.prepare(this.sql).bind(...this.boundValues);
    return (await stmt.first<T>()) ?? undefined;
  }
}
