// Polite HTML fetcher with rate limiting and robots-respecting defaults.
// Used to read company websites, leadership pages, contact pages, and public bios.

import type { Fetcher, FetchResult } from "./provider.js";

export interface HtmlFetcherOptions {
  userAgent?: string;
  delayMs?: number; // min ms between fetches
  maxBytes?: number; // truncate response body
  timeoutMs?: number;
}

export class HtmlFetcher implements Fetcher {
  private readonly userAgent: string;
  private readonly delayMs: number;
  private readonly maxBytes: number;
  private readonly timeoutMs: number;
  private lastFetch = 0;

  constructor(opts: HtmlFetcherOptions = {}) {
    this.userAgent =
      opts.userAgent ??
      process.env.FETCH_USER_AGENT ??
      "uae-intel-research/1.0 (+public business intelligence research)";
    this.delayMs = Number(process.env.FETCH_DELAY_MS ?? opts.delayMs ?? 150);
    this.maxBytes = opts.maxBytes ?? 200_000;
    this.timeoutMs = Number(process.env.FETCH_TIMEOUT_MS ?? opts.timeoutMs ?? 8_000);
  }

  async fetch(url: string): Promise<FetchResult | null> {
    await this.respectRateLimit();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        return null;
      }
      const buf = await res.arrayBuffer();
      const html = new TextDecoder("utf-8").decode(buf.slice(0, this.maxBytes));
      const finalUrl = res.url ?? url;
      return {
        url: finalUrl,
        title: extractTitle(html),
        text: stripHtml(html),
        // Links are extracted BEFORE stripping tags — stripHtml discards all
        // attributes (including href), so this is the only place hyperlinks
        // (e.g. LinkedIn profile URLs) can be recovered from a fetched page.
        links: extractLinks(html, finalUrl),
        status: res.status,
      };
    } catch {
      return null;
    }
  }

  private async respectRateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastFetch;
    if (elapsed < this.delayMs) {
      await new Promise((r) => setTimeout(r, this.delayMs - elapsed));
    }
    this.lastFetch = Date.now();
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

/** Extract absolute hyperlink URLs (href values) from raw HTML, resolved against the page URL. */
export function extractLinks(html: string, baseUrl: string): string[] {
  const found = new Set<string>();
  const matches = html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["']/gi);
  for (const m of matches) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      const abs = new URL(raw, baseUrl).toString();
      found.add(abs);
    } catch {
      // Ignore malformed hrefs (mailto:, javascript:, tel: without a value, etc.)
    }
  }
  return [...found];
}

/** Very small HTML-to-text converter. Avoids a dependency. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}
