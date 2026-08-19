// Identity resolution — implements §5 of the master prompt.
// Compares candidates across independent identifiers and computes a confidence score.

import type { IdentityCandidate, Source } from "@uae-intel/core";
import { computeIdentityConfidence } from "@uae-intel/core";

export interface ResolveInput {
  queryName: string;
  queryCompany?: string;
  queryTitle?: string;
  queryLocation?: string;
  queryLinkedin?: string;
  candidate: {
    name: string;
    nameVariations?: string[];
    company?: string;
    title?: string;
    location?: string;
    linkedin?: string;
    bio?: string;
  };
  sources: Source[];
}

export function resolveIdentity(input: ResolveInput): IdentityCandidate {
  const c = input.candidate;
  const q = input;

  const identifiers = [
    { name: "name", weight: 30, present: namesMatch(q.queryName, c.name, c.nameVariations) },
    {
      name: "company",
      weight: 25,
      present: q.queryCompany ? stringsMatch(q.queryCompany, c.company) : false,
    },
    {
      name: "title",
      weight: 15,
      present: q.queryTitle ? stringsMatch(q.queryTitle, c.title) : false,
    },
    {
      name: "location",
      weight: 10,
      present: q.queryLocation ? stringsMatch(q.queryLocation, c.location) : false,
    },
    {
      name: "linkedin",
      weight: 20,
      present: q.queryLinkedin
        ? (c.linkedin?.toLowerCase().includes(q.queryLinkedin.toLowerCase()) ?? false)
        : false,
    },
  ];

  const confidence = computeIdentityConfidence(identifiers);
  const supporting_evidence: string[] = [];
  const potential_issues: string[] = [];

  for (const i of identifiers) {
    if (i.present) supporting_evidence.push(`✓ Matching ${i.name}`);
  }
  if (!identifiers.find((i) => i.name === "name")?.present) {
    potential_issues.push("Name does not match the query.");
  }
  if (c.nameVariations && c.nameVariations.length > 0) {
    potential_issues.push(
      `Name appears with variations: ${c.nameVariations.join(", ")}`,
    );
  }

  return {
    person: {
      full_name: c.name,
      name_variations: c.nameVariations ?? [],
      current_title: c.title ?? null,
      location: c.location ?? null,
      linkedin_url: c.linkedin ?? null,
      confidence_score: confidence,
    },
    sources: input.sources,
    supporting_evidence,
    potential_issues,
    confidence,
  };
}

function normalize(s: string | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function namesMatch(
  query: string,
  candidate: string,
  variations?: string[],
): boolean {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return false;
  if (q === c) return true;
  if (c.includes(q) || q.includes(c)) return true;
  // Token overlap: all query tokens present in candidate.
  const qTokens = new Set(q.split(" "));
  const cTokens = new Set(c.split(" "));
  let hits = 0;
  for (const t of qTokens) if (cTokens.has(t) && t.length > 2) hits++;
  if (hits >= Math.max(1, Math.ceil(qTokens.size * 0.6))) return true;
  // Check variations.
  for (const v of variations ?? []) {
    if (stringsMatch(query, v)) return true;
  }
  return false;
}

function stringsMatch(a?: string, b?: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // Significant token overlap.
  const ta = new Set(na.split(" "));
  const tb = new Set(nb.split(" "));
  let hits = 0;
  for (const t of ta) if (tb.has(t) && t.length > 2) hits++;
  return hits >= Math.max(1, Math.ceil(Math.min(ta.size, tb.size) * 0.6));
}
