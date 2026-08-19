// POST /api/research — run a research request and return the §15 report.
import { NextRequest, NextResponse } from "next/server";
import { ResearchEngine, TavilyProvider, HtmlFetcher } from "@uae-intel/research";
import { generateReport } from "@uae-intel/report";
import type { ResearchDepth } from "@uae-intel/core";
import { getDb, getWaitUntil } from "@/lib/server";
import { persistResearchResult } from "@/lib/persist";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    company?: string;
    title?: string;
    location?: string;
    linkedinUrl?: string;
    industry?: string;
    depth?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name && !body.company && !body.linkedinUrl) {
    return NextResponse.json(
      { error: "At least one of name, company, or linkedinUrl is required." },
      { status: 400 },
    );
  }

  const depth = (body.depth?.toUpperCase() ?? "STANDARD") as ResearchDepth;
  if (!["QUICK", "STANDARD", "DEEP", "DUE DILIGENCE"].includes(depth)) {
    return NextResponse.json({ error: "Invalid depth" }, { status: 400 });
  }

  try {
    const search = new TavilyProvider();
    const fetcher = new HtmlFetcher({ timeoutMs: 8000, delayMs: 100 });
    const engine = new ResearchEngine(search, fetcher);
    const result = await engine.run({
      name: body.name,
      company: body.company,
      title: body.title,
      location: body.location,
      linkedinUrl: body.linkedinUrl,
      industry: body.industry,
      depth,
    });
    const report = generateReport(result);

    // Save the resolved identity + contacts in the background so this
    // person becomes browsable from the Dashboard/Persons page.
    const db = await getDb();
    const waitUntil = await getWaitUntil();
    waitUntil(persistResearchResult(db, result.identity, result.contacts, { company: body.company, title: body.title }));

    return NextResponse.json({
      report,
      identity_confidence: result.identity?.confidence ?? 0,
      contacts_found: result.contacts.length,
      sources_count: result.allSources.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
