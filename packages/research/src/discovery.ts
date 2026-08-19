// Bulk discovery engine — broad queries return 100+ executives as a list.
// Unlike the single-person ResearchEngine, this is optimized for LIST discovery.
// Public business contacts only. No personal mobiles/emails.

import type {
  ContactCandidate,
  SearchResult,
  Source,
  Emirate,
  Industry,
  Position,
} from "@uae-intel/core";
import { makeSource, dedupeSources } from "@uae-intel/core";
import type { Fetcher, SearchProvider } from "./provider.js";
import {
  extractEmails,
  extractPhones,
  extractLinkedIn,
  sourceFromPage,
} from "./extractors.js";

export interface DiscoveryRequest {
  /** Free-text query, e.g. "CEOs of real estate companies in Dubai" */
  query: string;
  /** Parsed filters (optional — derived from query if not provided) */
  position?: Position;
  industry?: Industry;
  emirate?: Emirate;
  /** Max results to return (default 100) */
  maxResults?: number;
}

export interface DiscoveredPerson {
  name: string;
  name_variations: string[];
  title: string | null;
  company: string | null;
  industry: Industry | null;
  emirate: Emirate | null;
  location: string | null;
  linkedin_url: string | null;
  company_website: string | null;
  business_phone: string | null;
  company_email: string | null;
  confidence: number;
  sources: Source[];
}

export interface DiscoveryResult {
  request: DiscoveryRequest;
  people: DiscoveredPerson[];
  total_found: number;
  sources: Source[];
  unknowns: string[];
}

const POSITIONS: Position[] = [
  "CEO", "Founder", "Owner", "Director", "Managing Director",
  "Chairman", "Partner", "Investor", "Executive",
];

const INDUSTRIES: Industry[] = [
  "Real estate", "Construction", "Finance", "Technology", "Healthcare",
  "Hospitality", "Retail", "Manufacturing", "Logistics", "Energy",
  "Professional services",
];

const EMIRATES: Emirate[] = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman",
  "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
];

export class DiscoveryEngine {
  constructor(
    private readonly search: SearchProvider,
    private readonly fetcher: Fetcher,
  ) { }

  async run(request: DiscoveryRequest): Promise<DiscoveryResult> {
    const maxResults = request.maxResults ?? 100;
    const parsed = parseQuery(request.query);
    const position = request.position ?? parsed.position;
    const industry = request.industry ?? parsed.industry;
    const emirate = request.emirate ?? parsed.emirate;

    // Build multiple search queries to maximize coverage.
    const queries = buildDiscoveryQueries(request.query, position, industry, emirate);
    const allResults: SearchResult[] = [];
    for (const q of queries) {
      const results = await this.search.search(q, { maxResults: 10 });
      allResults.push(...results);
    }

    // Extract people from search results.
    const people = extractPeopleFromResults(allResults, position, industry, emirate);

    // Fetch company pages to enrich contacts.
    const enriched = await this.enrichWithContacts(people, allResults);

    // Dedupe by name.
    const deduped = dedupeByName(enriched);

    // Sort by confidence, limit to maxResults.
    const final = deduped
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);

    const allSources = dedupeSources(
      allResults.map((r) =>
        makeSource({
          url: r.url,
          name: r.title || r.url,
          source_type: r.source_type,
          confirms: r.snippet.slice(0, 200),
        }),
      ),
    );

    const unknowns: string[] = [];
    if (final.length === 0) unknowns.push("No executives found for this query. Try broadening the search terms.");
    const withoutContacts = final.filter((p) => !p.business_phone && !p.company_email);
    if (withoutContacts.length > 0) {
      unknowns.push(`${withoutContacts.length} of ${final.length} people have no public business contact discovered.`);
    }

    return {
      request,
      people: final,
      total_found: final.length,
      sources: allSources,
      unknowns,
    };
  }

  private async enrichWithContacts(
    people: DiscoveredPerson[],
    results: SearchResult[],
  ): Promise<DiscoveredPerson[]> {
    // Build a map of company → search result URL for fetching.
    const companyUrls = new Map<string, string>();
    for (const r of results) {
      const lower = r.url.toLowerCase();
      if (
        lower.includes("linkedin.com") ||
        lower.includes("wikipedia.org") ||
        lower.includes("instagram.com") ||
        lower.includes("facebook.com") ||
        lower.includes("youtube.com")
      ) continue;
      // Use the URL's domain as a key.
      const domain = extractDomain(r.url);
      if (domain) companyUrls.set(domain, r.url);
    }

    // For each person, try to find contacts from their company website.
    for (const person of people) {
      if (!person.company_website) {
        // Try to match company name to a URL from results.
        if (person.company) {
          const match = results.find(
            (r) =>
              r.title.toLowerCase().includes(person.company!.toLowerCase()) ||
              r.snippet.toLowerCase().includes(person.company!.toLowerCase()),
          );
          if (match) person.company_website = match.url;
        }
      }

      if (person.company_website) {
        const page = await this.fetcher.fetch(person.company_website);
        if (page) {
          const pageSource = sourceFromPage(page.url, page.title, `Company page for ${person.company ?? person.name}`);
          const emails = extractEmails(page.text, pageSource);
          const phones = extractPhones(page.text, pageSource);
          const linkedins = extractLinkedIn(page.text, pageSource);

          if (!person.company_email && emails.length > 0) {
            const best = emails.find((e) => e.type === "company_email") ?? emails[0];
            person.company_email = best.value;
          }
          if (!person.business_phone && phones.length > 0) {
            person.business_phone = phones[0].value;
          }
          if (!person.linkedin_url && linkedins.length > 0) {
            const profile = linkedins.find((l) => l.type === "linkedin");
            if (profile) person.linkedin_url = profile.value;
          }
          person.sources.push(pageSource);
        }
      }
    }

    return people;
  }
}

// ---------- Query parsing & building ----------

interface ParsedQuery {
  position?: Position;
  industry?: Industry;
  emirate?: Emirate;
}

export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  const result: ParsedQuery = {};

  for (const p of POSITIONS) {
    if (lower.includes(p.toLowerCase())) {
      result.position = p;
      break;
    }
  }
  // Also check common variants.
  if (!result.position) {
    if (lower.includes("chief executive")) result.position = "CEO";
    else if (lower.includes("managing dir")) result.position = "Managing Director";
    else if (lower.includes("board")) result.position = "Director";
    else if (lower.includes("business owner") || lower.includes("owner")) result.position = "Owner";
    else if (lower.includes("millionaire") || lower.includes("wealthy") || lower.includes("rich") || lower.includes("high net worth")) result.position = "Founder";
  }

  for (const ind of INDUSTRIES) {
    if (lower.includes(ind.toLowerCase())) {
      result.industry = ind;
      break;
    }
  }

  for (const em of EMIRATES) {
    if (lower.includes(em.toLowerCase())) {
      result.emirate = em;
      break;
    }
  }
  if (!result.emirate && (lower.includes("uae") || lower.includes("united arab emirates"))) {
    // No specific emirate — leave undefined for "all UAE".
  }

  return result;
}

function buildDiscoveryQueries(
  originalQuery: string,
  position?: Position,
  industry?: Industry,
  emirate?: Emirate,
): string[] {
  const queries: string[] = [];
  const loc = emirate ?? "UAE";
  const pos = position ?? "CEO OR Founder OR Director";
  const ind = industry ?? "";

  // Broad queries to maximize coverage.
  queries.push(originalQuery);
  queries.push(`${pos} ${ind} ${loc} list`.trim());
  queries.push(`top ${pos} ${ind} ${loc}`.trim());
  queries.push(`${pos} ${ind} companies ${loc} leadership`.trim());
  queries.push(`list of ${pos} ${ind} ${loc}`.trim());
  if (industry) {
    queries.push(`${industry} companies ${loc} management team`);
    queries.push(`${industry} ${loc} executives directory`);
  }
  if (position === "Founder" || position === "CEO") {
    queries.push(`top entrepreneurs ${loc} ${ind}`.trim());
    queries.push(`wealthiest businessmen ${loc} ${ind}`.trim());
  }
  queries.push(`${pos} ${loc} business directory`.trim());

  return queries
    .map((q) => q.replace(/\s+/g, " ").trim())
    .filter((q) => q.length > 5);
}

// ---------- People extraction from search results ----------

function extractPeopleFromResults(
  results: SearchResult[],
  position?: Position,
  industry?: Industry,
  emirate?: Emirate,
): DiscoveredPerson[] {
  const people: DiscoveredPerson[] = [];
  const seenNames = new Set<string>();

  for (const result of results) {
    const text = `${result.title}\n${result.snippet}`;
    const extracted = extractNamesFromText(text, result);

    for (const name of extracted) {
      const lowerName = name.toLowerCase();
      if (seenNames.has(lowerName)) continue;
      if (!isPlausiblePersonName(name)) continue;

      seenNames.add(lowerName);
      const company = extractCompanyFromContext(text, name);
      const title = extractTitleFromContext(text, name) ?? position ?? null;

      people.push({
        name: name.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim(),
        name_variations: [],
        title: title ? title.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim() : null,
        company: company ? company.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim() : null,
        industry: industry ?? null,
        emirate: emirate ?? null,
        location: emirate ? `${emirate}, UAE` : "UAE",
        linkedin_url: null,
        company_website: null,
        business_phone: null,
        company_email: null,
        confidence: computeDiscoveryConfidence(name, company, title, result),
        sources: [
          makeSource({
            url: result.url,
            name: result.title,
            source_type: result.source_type,
            confirms: `Discovery result mentioning ${name}`,
          }),
        ],
      });
    }
  }

  return people;
}

function extractNamesFromText(text: string, result: SearchResult): string[] {
  const names: string[] = [];

  // Pattern 1: "Mr. / H.E. / Dr. / Sheikh Name Name Name"
  const prefixMatches = text.matchAll(
    /(?:Mr\.|Mrs\.|Ms\.|H\.E\.|Dr\.|Sheikh)\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})/g,
  );
  for (const m of prefixMatches) {
    if (m[1]) names.push(m[1].trim());
  }

  // Pattern 2: "Name Name — CEO" or "Name Name | CEO" or "Name Name, CEO"
  const titleMatches = text.matchAll(
    /([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,4})\s*(?:[-–,|])\s*(?:Group\s+)?(?:Chief\s+)?(?:CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Director|Owner|Partner|Investor|Executive)/g,
  );
  for (const m of titleMatches) {
    if (m[1]) names.push(m[1].trim());
  }

  // Pattern 3: LinkedIn profile URLs — extract the name slug
  const linkedinMatches = text.matchAll(
    /linkedin\.com\/in\/([a-z0-9-]+)/gi,
  );
  for (const m of linkedinMatches) {
    const slug = m[1];
    if (slug && slug.length > 3) {
      const name = slug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      if (isPlausiblePersonName(name)) names.push(name);
    }
  }

  // Pattern 4: "Name Name" in result title (often a person's name page)
  if (result.title && !result.title.includes("|") && !result.title.includes("—")) {
    const titleWords = result.title.trim().split(/\s+/);
    if (titleWords.length >= 2 && titleWords.length <= 5) {
      const allCapitalized = titleWords.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w));
      if (allCapitalized && isPlausiblePersonName(result.title.trim())) {
        names.push(result.title.trim());
      }
    }
  }

  return [...new Set(names)];
}

function extractCompanyFromContext(text: string, name: string): string | null {
  // Look for "Name, CEO of Company" or "Name — CEO, Company" or "CEO at Company"
  // Only match clean company names (proper nouns, not sentence fragments).
  const patterns = [
    new RegExp(`${escapeRegex(name)}[\\s,]*(?:[-–,|])?\\s*(?:Group\\s+)?(?:Chief\\s+)?(?:CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Director|Owner|Partner|Executive)[\\s,]*(?:of|at)\\s+([A-Z][\\w&'.-]+(?:\\s+[A-Z&][\\w&'.-]+){0,4})`, "i"),
    /(?:CEO|Founder|Managing Director|Chairman|Director|Owner|Partner|Executive)\s+(?:of|at)\s+([A-Z][\w&'.-]+(?:\s+[A-Z&][\w&'.-]+){0,4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      let company = m[1].trim();
      // Clean up newlines and extra whitespace.
      company = company.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();
      // Clean up trailing prepositions/articles.
      company = company.replace(/\s+(?:at|in|on|with|for|the|a|an)$/i, "");
      company = company.replace(/[,.;:].*$/, "");
      // Reject if it's a common word or too short.
      if (company.length < 3 || isCommonWord(company)) continue;
      // Reject single common business words as company names.
      const companyStopWords = new Set(["Sales", "Homes", "Societ", "Board"]);
      if (companyStopWords.has(company)) continue;
      // Reject if it contains lowercase-only words (likely a sentence fragment).
      const words = company.split(/\s+/);
      const hasLowerOnly = words.some((w) => w.length > 2 && /^[a-z]+$/.test(w));
      if (hasLowerOnly) continue;
      return company;
    }
  }
  return null;
}

function extractTitleFromContext(text: string, name: string): string | null {
  const patterns = [
    new RegExp(`${escapeRegex(name)}[\\s,]*(?:[-–,|])?\\s*(?:Group\\s+)?(?:Chief\\s+)?(CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Director|Owner|Partner|Investor|Executive)`, "i"),
    /(?:Group\s+)?(?:Chief\s+)?(CEO|Chief Executive Officer|Founder|Managing Director|Chairman|Director|Owner|Partner|Investor|Executive)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const title = m[1].trim();
      if (title.toLowerCase() === "chief executive officer") return "CEO";
      return title;
    }
  }
  return null;
}

function computeDiscoveryConfidence(
  name: string,
  company: string | null,
  title: string | null,
  result: SearchResult,
): number {
  let score = 30; // base
  if (company) score += 20;
  if (title) score += 15;
  if (name.split(/\s+/).length >= 2) score += 10;
  if (result.source_type === "publication") score += 10;
  if (result.source_type === "official") score += 15;
  if (result.source_type === "company") score += 10;
  return Math.min(90, score);
}

function dedupeByName(people: DiscoveredPerson[]): DiscoveredPerson[] {
  const byName = new Map<string, DiscoveredPerson>();
  for (const p of people) {
    const key = p.name.toLowerCase().trim();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, p);
    } else {
      // Merge: keep the higher confidence, fill missing fields.
      if (p.confidence > existing.confidence) {
        existing.confidence = p.confidence;
      }
      existing.company = existing.company ?? p.company;
      existing.title = existing.title ?? p.title;
      existing.linkedin_url = existing.linkedin_url ?? p.linkedin_url;
      existing.company_website = existing.company_website ?? p.company_website;
      existing.business_phone = existing.business_phone ?? p.business_phone;
      existing.company_email = existing.company_email ?? p.company_email;
      existing.sources = [...existing.sources, ...p.sources];
    }
  }
  return [...byName.values()];
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COMMON_WORDS = new Set([
  "Emaar", "Properties", "Dubai", "Group", "Company", "Board",
  "Director", "Executive", "Officer", "Chief", "Properties PJSC",
  "United Arab Emirates", "Real Estate", "Community Management",
  "Facilities Management", "Asset Management", "Development Management",
  "Board Of Directors", "Executive Team", "Key People",
  "LinkedIn", "Wikipedia", "Forbes", "Bloomberg",
]);

function isCommonWord(s: string): boolean {
  return COMMON_WORDS.has(s.trim());
}

function isPlausiblePersonName(name: string): boolean {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;

  const stopWords = new Set([
    "and", "the", "of", "with", "serving", "as", "Vice", "concurrently",
    "Community", "Facilities", "Asset", "Management", "Development",
    "Board", "Executive", "Team", "Properties", "Group", "Company",
    "LinkedIn", "Wikipedia", "Forbes", "Bloomberg", "Reuters",
    "News", "Report", "Story", "Post", "Activity",
    "Meet", "Our", "CEO", "Chairman", "Founder", "Director", "Owner",
    "Partner", "Investor", "Message", "From", "Co", "Statement",
    "Independent", "Non", "Investment", "Authority", "Market",
    "Dubai", "Abu", "Dhabi", "UAE", "Real", "Estate", "Restaurants",
    "Americana", "Bank", "Homes", "Life", "Luxury", "Department",
    "Sales", "Societ", "Realty", "Board", "National", "Natio",
    "Zayed", "Rd", "MUDASIR", "WANI",
  ]);

  for (const w of words) {
    if (stopWords.has(w)) return false;
    if (!/^[A-Z][a-zA-Z.'-]*$/.test(w)) return false;
  }

  // Reject if the name is actually a phrase (all words are common business terms).
  const personWords = words.filter((w) => !stopWords.has(w));
  if (personWords.length < 2) return false;

  // Reject names that are too long to be a single name (likely a sentence fragment).
  if (trimmed.length > 40) return false;

  return true;
}
