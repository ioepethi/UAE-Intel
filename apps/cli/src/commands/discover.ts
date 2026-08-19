// `discover <query>` — bulk discovery search engine.
// e.g. `uae-intel discover "CEOs of real estate companies in Dubai"`

import { DiscoveryEngine, TavilyProvider, HtmlFetcher } from "@uae-intel/research";
import { getEngine, writeFile } from "../lib.js";
import type { Emirate, Industry, Position } from "@uae-intel/core";

export interface DiscoverArgs {
  query: string;
  position?: string;
  industry?: string;
  emirate?: string;
  maxResults?: string;
  out?: string;
  format?: string; // "table" | "csv" | "json"
}

export async function discover(args: DiscoverArgs): Promise<void> {
  const engine = getEngine() as unknown; // not used — we build a DiscoveryEngine
  const search = new TavilyProvider();
  const fetcher = new HtmlFetcher();
  const discoveryEngine = new DiscoveryEngine(search, fetcher);

  console.log(`Discovering: "${args.query}"…\n`);
  const result = await discoveryEngine.run({
    query: args.query,
    position: args.position as Position | undefined,
    industry: args.industry as Industry | undefined,
    emirate: args.emirate as Emirate | undefined,
    maxResults: args.maxResults ? Number(args.maxResults) : 100,
  });

  const format = args.format ?? "table";
  if (args.out) {
    const content = format === "csv" ? toCSV(result.people) : format === "json" ? JSON.stringify(result, null, 2) : toTable(result.people);
    writeFile(args.out, content);
    return;
  }

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (format === "csv") {
    console.log(toCSV(result.people));
    return;
  }

  // Default: table output
  console.log(`Found ${result.total_found} people\n`);
  console.log(toTable(result.people));

  if (result.unknowns.length > 0) {
    console.log("\nNotes:");
    for (const u of result.unknowns) console.log(`  - ${u}`);
  }
}

function toTable(people: DiscoveredPerson[]): string {
  if (people.length === 0) return "No results.";
  const lines: string[] = [];
  // Header
  lines.push(
    pad("Name", 30) + pad("Title", 18) + pad("Company", 25) + pad("Emirate", 14) + pad("Phone", 18) + pad("Email", 28) + "LinkedIn",
  );
  lines.push("-".repeat(140));
  for (const p of people) {
    lines.push(
      pad(p.name, 30) +
      pad(p.title ?? "—", 18) +
      pad(p.company ?? "—", 25) +
      pad(p.emirate ?? "UAE", 14) +
      pad(p.business_phone ?? "—", 18) +
      pad(p.company_email ?? "—", 28) +
      (p.linkedin_url ?? "—"),
    );
  }
  return lines.join("\n");
}

function toCSV(people: DiscoveredPerson[]): string {
  const headers = ["Name", "Title", "Company", "Industry", "Emirate", "Location", "Business Phone", "Company Email", "LinkedIn", "Company Website", "Confidence"];
  const rows = people.map((p) => [
    p.name,
    p.title ?? "",
    p.company ?? "",
    p.industry ?? "",
    p.emirate ?? "",
    p.location ?? "",
    p.business_phone ?? "",
    p.company_email ?? "",
    p.linkedin_url ?? "",
    p.company_website ?? "",
    String(p.confidence),
  ]);
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

function pad(s: string, len: number): string {
  if (s.length >= len) return s.slice(0, len - 1) + " ";
  return s + " ".repeat(len - s.length);
}

// Import the type for local use
import type { DiscoveredPerson } from "@uae-intel/research";
