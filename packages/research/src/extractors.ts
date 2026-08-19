// Lightweight extractors that pull structured facts from fetched text.
// No NLP dependency — pattern-based, conservative. Anything ambiguous is left as NOT VERIFIED.

import type {
  ContactCandidate,
  ContactType,
  Source,
} from "@uae-intel/core";
import {
  looksLikeEmail,
  looksLikeLinkedInUrl,
  looksLikePhone,
  makeSource,
} from "@uae-intel/core";

/** Extract emails from text. Only public/business-looking addresses. */
export function extractEmails(
  text: string,
  source: Source,
): ContactCandidate[] {
  const found = new Set<string>();
  const matches = text.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/g) ?? [];
  for (const m of matches) {
    const lower = m.toLowerCase();
    // Skip obvious personal/junk addresses; keep professional/company domains.
    if (
      lower.includes("@example.") ||
      lower.includes("@sentry.") ||
      lower.includes("@wixpress.") ||
      lower.includes("@yourdomain.") ||
      lower.startsWith("noreply@") ||
      lower.startsWith("no-reply@")
    ) {
      continue;
    }
    found.add(lower);
  }
  return [...found].map((value) => ({
    type: value.includes("info@") || value.includes("contact@")
      ? "company_email"
      : "professional_email",
    value,
    classification: "public" as const,
    verification: "MEDIUM" as const, // found in public text but not yet corroborated
    confidence: 60,
    source,
  }));
}

/** Extract phone numbers (UAE + international). Conservative — only accept clearly phone-formatted numbers. */
export function extractPhones(
  text: string,
  source: Source,
): ContactCandidate[] {
  const found = new Set<string>();
  // Only match numbers with explicit phone indicators: + prefix, or parentheses, or "Tel:"/"Phone:"/"Call:" context.
  // This is conservative by design — false negatives are better than false positives for contact data.

  // Pattern 1: +countrycode with spaces/dashes (e.g. +971 4 123 4567, +1 (555) 123-4567)
  const intlMatches = text.match(/\+\d[\d\s\-().]{6,16}\d/g) ?? [];
  for (const m of intlMatches) {
    const cleaned = m.trim();
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) continue;
    // Skip if it looks like a date with + (rare but possible).
    if (/\d{4}-\d{2}-\d{2}/.test(cleaned)) continue;
    found.add(cleaned);
  }

  // Pattern 2: UAE local format with explicit phone context (Tel: 04 123 4567, Phone: 050 123 4567)
  const contextMatches = text.match(/(?:Tel|Phone|Fax|Call|Contact)[:\s]+(\d[\d\s\-().]{6,14}\d)/gi) ?? [];
  for (const m of contextMatches) {
    const cleaned = m.replace(/^(?:Tel|Phone|Fax|Call|Contact)[:\s]+/i, "").trim();
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) continue;
    if (/\d{4}-\d{2}-\d{2}/.test(cleaned)) continue;
    found.add(cleaned);
  }

  return [...found].map((value) => ({
    type: "business_phone" as ContactType,
    value,
    classification: "public" as const,
    verification: "MEDIUM" as const,
    confidence: 55,
    source,
  }));
}

/** Extract LinkedIn profile/company URLs. */
export function extractLinkedIn(
  text: string,
  source: Source,
): ContactCandidate[] {
  const found = new Set<string>();
  const matches =
    text.match(/https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|company)\/[^"?#\s)]+/gi) ??
    [];
  for (const m of matches) {
    if (looksLikeLinkedInUrl(m)) found.add(m.trim());
  }
  return [...found].map((value) => ({
    type: value.includes("/company/")
      ? "company_linkedin"
      : "linkedin",
    value,
    classification: "public" as const,
    verification: "HIGH" as const, // LinkedIn URLs are self-identifying
    confidence: 80,
    source,
  }));
}

/** Extract candidate company website URLs from text. */
export function extractCompanyUrls(text: string): string[] {
  const found = new Set<string>();
  const matches =
    text.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s)"']*)?/gi) ?? [];
  for (const m of matches) {
    const lower = m.toLowerCase();
    if (
      lower.includes("linkedin.com") ||
      lower.includes("facebook.com") ||
      lower.includes("twitter.com") ||
      lower.includes("x.com") ||
      lower.includes("instagram.com") ||
      lower.includes("youtube.com") ||
      lower.includes("wikipedia.org") ||
      lower.includes("google.com") ||
      lower.includes("tavily.com")
    ) {
      continue;
    }
    found.add(m.replace(/[.,;:)]+$/, ""));
  }
  return [...found];
}

/** Build a Source from a fetched page. */
export function sourceFromPage(
  url: string,
  title: string,
  confirms: string,
): Source {
  return makeSource({
    url,
    name: title || url,
    source_type: "company",
    confirms,
  });
}
