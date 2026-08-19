// The research engine — orchestrates §4 PHASES 1–6.
// Public-data only. No auth bypass, no LinkedIn behind login, no fabrication.

import type {
  ContactCandidate,
  IdentityCandidate,
  ResearchDepth,
  SearchResult,
  Source,
} from "@uae-intel/core";
import { makeSource, dedupeSources } from "@uae-intel/core";
import type { Fetcher, SearchProvider } from "./provider.js";
import { resolveIdentity, type ResolveInput } from "./identity.js";
import {
  extractEmails,
  extractPhones,
  extractLinkedIn,
  extractCompanyUrls,
  sourceFromPage,
} from "./extractors.js";

export interface ResearchRequest {
  name?: string;
  company?: string;
  title?: string;
  location?: string; // e.g. "Dubai, UAE"
  linkedinUrl?: string;
  industry?: string;
  depth?: ResearchDepth;
}

export interface ResearchResult {
  request: ResearchRequest;
  discovery: SearchResult[];
  identity: IdentityCandidate | null;
  companySources: Source[];
  contacts: ContactCandidate[];
  conflicts: { claim: string; assessment: string }[];
  unknowns: string[];
  allSources: Source[];
}

const DEPTH_QUERY_COUNT: Record<ResearchDepth, number> = {
  QUICK: 3,
  STANDARD: 6,
  DEEP: 10,
  "DUE DILIGENCE": 14,
};

export class ResearchEngine {
  constructor(
    private readonly search: SearchProvider,
    private readonly fetcher: Fetcher,
  ) { }

  async run(request: ResearchRequest): Promise<ResearchResult> {
    const depth = request.depth ?? "STANDARD";
    const maxQueries = DEPTH_QUERY_COUNT[depth];

    // PHASE 1 — DISCOVERY
    const queries = buildDiscoveryQueries(request).slice(0, maxQueries);
    const discovery: SearchResult[] = [];
    for (const q of queries) {
      const results = await this.search.search(q, { maxResults: 8 });
      discovery.push(...results);
    }

    // PHASE 2 — IDENTITY RESOLUTION
    const identity = await this.resolveIdentityFromResults(request, discovery);

    // PHASE 3 — COMPANY RESEARCH
    const companySources = await this.researchCompany(request, discovery, depth);

    // PHASE 5 — CONTACT DISCOVERY
    const contacts = await this.discoverContacts(request, discovery, companySources);

    // PHASE 6 — VERIFICATION (lightweight: dedupe sources, flag unknowns)
    const allSources = dedupeSources([
      ...discovery.map((d) =>
        makeSource({
          url: d.url,
          name: d.title || d.url,
          source_type: d.source_type,
          confirms: d.snippet.slice(0, 200),
        }),
      ),
      ...companySources,
      ...contacts.map((c) => c.source),
    ]);

    const unknowns: string[] = [];
    if (!identity) unknowns.push("No confident identity match could be established from public sources.");
    if (contacts.length === 0) unknowns.push("No public business contacts discovered.");
    if (!request.company) unknowns.push("Company was not provided; company research is limited.");

    const conflicts: { claim: string; assessment: string }[] = [];

    return {
      request,
      discovery,
      identity,
      companySources,
      contacts,
      conflicts,
      unknowns,
      allSources,
    };
  }

  private async resolveIdentityFromResults(
    request: ResearchRequest,
    discovery: SearchResult[],
  ): Promise<IdentityCandidate | null> {
    // If a name was provided, use it. Otherwise try to extract the executive name
    // from search results (e.g. "find ceo of Emaar" → discover "Amit Jain" from results).
    let resolvedName = request.name;
    if (!resolvedName && request.title && request.company) {
      resolvedName = extractExecutiveName(discovery, request.title, request.company) ?? undefined;
    }
    if (!resolvedName) return null;

    // Pick the most promising result that mentions the name.
    const candidateResult = discovery.find((r) =>
      r.title.toLowerCase().includes(resolvedName!.toLowerCase()) ||
      r.snippet.toLowerCase().includes(resolvedName!.toLowerCase()),
    );
    const sources = candidateResult
      ? [
        makeSource({
          url: candidateResult.url,
          name: candidateResult.title,
          source_type: candidateResult.source_type,
          confirms: `Discovery result mentioning ${resolvedName}`,
        }),
      ]
      : discovery.slice(0, 1).map((r) =>
        makeSource({
          url: r.url,
          name: r.title,
          source_type: r.source_type,
          confirms: `Discovery result for ${request.title} at ${request.company}`,
        }),
      );

    const input: ResolveInput = {
      queryName: resolvedName,
      queryCompany: request.company,
      queryTitle: request.title,
      queryLocation: request.location,
      queryLinkedin: request.linkedinUrl,
      candidate: {
        name: resolvedName,
        company: request.company,
        title: request.title,
        location: request.location,
        linkedin: request.linkedinUrl,
      },
      sources,
    };
    return resolveIdentity(input);
  }

  private async researchCompany(
    request: ResearchRequest,
    discovery: SearchResult[],
    depth: ResearchDepth,
  ): Promise<Source[]> {
    if (!request.company) return [];
    const sources: Source[] = [];
    // Try to fetch the most likely company homepage and about/leadership pages.
    const candidateUrls = discovery
      .filter((r) => r.source_type === "company" || r.source_type === "unverified")
      .map((r) => r.url)
      .slice(0, depth === "DEEP" || depth === "DUE DILIGENCE" ? 5 : 2);
    for (const url of candidateUrls) {
      const page = await this.fetcher.fetch(url);
      if (page) {
        sources.push(sourceFromPage(page.url, page.title, `Company page for ${request.company}`));
      }
    }
    return sources;
  }

  private async discoverContacts(
    request: ResearchRequest,
    discovery: SearchResult[],
    companySources: Source[],
  ): Promise<ContactCandidate[]> {
    const contacts: ContactCandidate[] = [];
    // Pull contacts from company pages we fetched.
    for (const src of companySources) {
      const page = await this.fetcher.fetch(src.url);
      if (!page) continue;
      const pageSource = sourceFromPage(page.url, page.title, "Contact discovery");
      contacts.push(...extractEmails(page.text, pageSource));
      contacts.push(...extractPhones(page.text, pageSource));
      contacts.push(...extractLinkedIn(page.text, pageSource));
    }
    // Also scan discovery snippets for LinkedIn URLs.
    for (const r of discovery) {
      const snippetSource = makeSource({
        url: r.url,
        name: r.title,
        source_type: r.source_type,
        confirms: "Discovery snippet",
      });
      contacts.push(...extractLinkedIn(r.snippet, snippetSource));
    }
    // Dedupe by (type, value).
    const seen = new Set<string>();
    return contacts.filter((c) => {
      const key = `${c.type}|${c.value.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

function buildDiscoveryQueries(req: ResearchRequest): string[] {
  const q: string[] = [];
  const loc = req.location ?? "UAE";
  if (req.name) {
    q.push(`"${req.name}" ${req.company ?? ""} ${loc}`.trim());
    q.push(`"${req.name}" CEO OR founder OR director ${loc}`);
    q.push(`"${req.name}" LinkedIn ${loc}`);
    if (req.company) q.push(`"${req.name}" "${req.company}"`);
  }
  if (req.company) {
    q.push(`"${req.company}" CEO ${loc}`);
    q.push(`"${req.company}" founder ${loc}`);
    q.push(`"${req.company}" director ${loc}`);
    q.push(`"${req.company}" leadership team`);
    q.push(`"${req.company}" LinkedIn company`);
    q.push(`"${req.company}" website contact`);
  }
  if (req.linkedinUrl) {
    q.push(`site:linkedin.com "${req.linkedinUrl}"`);
  }
  if (req.industry && req.location) {
    q.push(`${req.industry} ${req.title ?? "CEO"} ${loc}`);
  }
  return q.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * Try to extract an executive's name from search results when only a title+company
 * was provided (e.g. "find ceo of Emaar" → discover "Amit Jain" from snippets).
 * Looks for patterns like "Amit Jain — CEO, Emaar" or "Group CEO ... Amit Jain".
 */
function extractExecutiveName(
  discovery: SearchResult[],
  title: string,
  company: string,
): string | null {
  const titleLower = title.toLowerCase();
  const companyLower = company.toLowerCase();

  // Strict patterns — ordered by reliability.
  const strictPatterns = [
    // "Name | CEO" or "Name | Group CEO" (Yahoo Finance / board page format)
    /\|\s*([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})\s*\|/,
    // "Amit Jain C.F.A. | Group Chief Executive Officer" (Yahoo Finance profile table)
    /([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})\s*(?:C\.?F\.?A\.?|CFA|MBA|PhD)?\s*\|\s*(?:Group\s+)?(?:Chief\s+)?(?:CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Director)/,
    // "Name — CEO, Company" (dash separator, only at start of line or after newline)
    /(?:^|\n)([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})\s*[-–]\s*(?:Group\s+)?(?:Chief\s+)?(?:CEO|Chief Executive Officer|Founder|Managing Director|Chairman)/,
    // "Mr. Amit Jain" / "H.E. Mohamed Alabbar" — only when followed by CEO/title keyword nearby
    /(?:Mr\.|Mrs\.|Ms\.|H\.E\.|Dr\.|Sheikh)\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})[^\n]{0,60}(?:CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Group Chief)/i,
  ];

  // Prioritize results whose TITLE contains the CEO keyword (more likely to be about the CEO specifically).
  const sorted = [...discovery].sort((a, b) => {
    const aHasCeo = a.title.toLowerCase().includes("ceo") || a.title.toLowerCase().includes("chief executive") ? 0 : 1;
    const bHasCeo = b.title.toLowerCase().includes("ceo") || b.title.toLowerCase().includes("chief executive") ? 0 : 1;
    return aHasCeo - bHasCeo;
  });

  for (const result of sorted) {
    const text = `${result.title}\n${result.snippet}`;
    if (!text.toLowerCase().includes(titleLower) && !text.toLowerCase().includes("ceo")) continue;
    if (!text.toLowerCase().includes(companyLower)) continue;

    for (const pattern of strictPatterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1]?.trim();
        if (name && name.length > 4 && !isCommonWord(name) && isPlausibleName(name)) {
          return name;
        }
      }
    }
  }
  return null;
}

function isCommonWord(s: string): boolean {
  const common = new Set([
    "Emaar", "Properties", "Dubai", "Group", "Company", "Board",
    "Director", "Executive", "Officer", "Chief", "Properties PJSC",
    "United Arab Emirates", "Real Estate", "Community Management",
    "Facilities Management", "Asset Management", "Development Management",
    "Board Of Directors", "Executive Team", "Key People",
  ]);
  return common.has(s);
}

function isPlausibleName(name: string): boolean {
  // A plausible person name: 2-5 capitalized words, no lowercase-only words, no conjunctions.
  const words = name.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  const stopWords = new Set([
    "and", "the", "of", "with", "serving", "as", "Vice", "concurrently",
    "Community", "Facilities", "Asset", "Management", "Development",
    "Board", "Executive", "Team", "Properties", "Group", "Company",
  ]);
  for (const w of words) {
    if (stopWords.has(w)) return false;
    // Each word should start with uppercase and contain at least one letter.
    if (!/^[A-Z][a-zA-Z.'-]*$/.test(w)) return false;
  }
  return true;
}
