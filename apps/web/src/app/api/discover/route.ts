// POST /api/discover — bulk discovery search engine.
import { NextRequest, NextResponse } from "next/server";
import { DiscoveryEngine, TavilyProvider, HtmlFetcher } from "@uae-intel/research";
import type { Emirate, Industry, Position } from "@uae-intel/core";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    query: string;
    position?: string;
    industry?: string;
    emirate?: string;
    maxResults?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.query) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  try {
    const search = new TavilyProvider();
    const fetcher = new HtmlFetcher();
    const engine = new DiscoveryEngine(search, fetcher);
    const result = await engine.run({
      query: body.query,
      position: body.position as Position | undefined,
      industry: body.industry as Industry | undefined,
      emirate: body.emirate as Emirate | undefined,
      maxResults: body.maxResults ?? 100,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
