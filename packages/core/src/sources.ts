// Source tracking helpers — implements §9 of the master prompt.

import type { Reliability, Source, SourceType } from "./types.js";

export const RELIABILITY_ORDER: Reliability[] = ["A", "B", "C", "D", "E"];

export function reliabilityFromSourceType(
  sourceType: SourceType,
): Reliability {
  switch (sourceType) {
    case "official":
      return "A";
    case "company":
      return "B";
    case "publication":
      return "C";
    case "database":
      return "D";
    case "unverified":
      return "E";
  }
}

export function betterReliability(a: Reliability, b: Reliability): Reliability {
  return RELIABILITY_ORDER.indexOf(a) < RELIABILITY_ORDER.indexOf(b) ? a : b;
}

export function makeSource(input: {
  url: string;
  name: string;
  source_type: SourceType;
  confirms: string;
  date_accessed?: string;
}): Source {
  return {
    url: input.url,
    name: input.name,
    source_type: input.source_type,
    reliability: reliabilityFromSourceType(input.source_type),
    date_accessed: input.date_accessed ?? new Date().toISOString(),
    confirms: input.confirms,
  };
}

export function dedupeSources(sources: Source[]): Source[] {
  const byUrl = new Map<string, Source>();
  for (const s of sources) {
    const existing = byUrl.get(s.url);
    if (!existing) {
      byUrl.set(s.url, s);
    } else {
      existing.reliability = betterReliability(
        existing.reliability,
        s.reliability,
      );
    }
  }
  return [...byUrl.values()];
}
