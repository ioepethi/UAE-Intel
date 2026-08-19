// Pluggable search provider interface.
// Tavily is the default; other providers (Serper, Brave) can be added by implementing this interface.
// Keys are read from env, never hardcoded (security standard §07).

import type { SearchResult } from "@uae-intel/core";

export interface SearchProvider {
  /** Run a web search and return ranked results with source-type hints. */
  search(query: string, opts?: { maxResults?: number }): Promise<SearchResult[]>;
}

export interface FetchResult {
  url: string;
  title: string;
  text: string; // plain text, truncated
  status: number;
}

export interface Fetcher {
  fetch(url: string): Promise<FetchResult | null>;
}
