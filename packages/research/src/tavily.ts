// Tavily search provider — https://docs.tavily.com
// API key is read from TAVILY_API_KEY env var. Never hardcoded.

import type { SearchResult, SourceType } from "@uae-intel/core";
import type { SearchProvider } from "./provider.js";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

export interface TavilyOptions {
  apiKey?: string; // defaults to process.env.TAVILY_API_KEY
  maxResults?: number; // default 10
}

export class TavilyProvider implements SearchProvider {
  private readonly apiKey: string;
  private readonly maxResults: number;

  constructor(opts: TavilyOptions = {}) {
    const key = opts.apiKey ?? process.env.TAVILY_API_KEY;
    if (!key) {
      throw new Error(
        "TAVILY_API_KEY is not set. Add it to .env (see .env.example).",
      );
    }
    this.apiKey = key;
    this.maxResults = opts.maxResults ?? 10;
  }

  async search(
    query: string,
    opts: { maxResults?: number } = {},
  ): Promise<SearchResult[]> {
    const maxResults = opts.maxResults ?? this.maxResults;
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        search_depth: "advanced",
        include_answer: true,
      }),
    });
    if (!res.ok) {
      throw new Error(`Tavily search failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as {
      results?: Array<{
        title: string;
        url: string;
        content: string;
        score?: number;
      }>;
    };
    return (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source_type: classifyUrl(r.url),
      reliability: reliabilityForType(classifyUrl(r.url)),
    }));
  }
}

function classifyUrl(url: string): SourceType {
  const u = url.toLowerCase();
  if (
    u.includes("gov.ae") ||
    u.includes(".gov.") ||
    u.includes("registry") ||
    u.includes("sec.gov") ||
    u.includes("dfsa.ae") ||
    u.includes("esma.gov.ae") ||
    u.includes("moec.gov.ae")
  ) {
    return "official";
  }
  if (
    u.includes("linkedin.com") ||
    u.includes("crunchbase.com") ||
    u.includes("bloomberg.com") ||
    u.includes("reuters.com") ||
    u.includes("thenationalnews.com") ||
    u.includes("khaleejtimes.com") ||
    u.includes("gulfnews.com") ||
    u.includes("arabianbusiness.com")
  ) {
    return "publication";
  }
  // Heuristic: company-controlled if the host root matches a company site we're researching.
  // Falls back to "publication" for news-like content, else "unverified".
  return "unverified";
}

function reliabilityForType(t: SourceType) {
  switch (t) {
    case "official":
      return "A" as const;
    case "company":
      return "B" as const;
    case "publication":
      return "C" as const;
    case "database":
      return "D" as const;
    case "unverified":
      return "E" as const;
  }
}
