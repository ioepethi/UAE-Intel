// Confidence scoring — implements §5 (identity) and §6 (contact) of the master prompt.

import type { Confidence, ContactVerification } from "./types.js";

export function classifyIdentityConfidence(score: Confidence): {
  label: string;
  band: "very-strong" | "strong" | "possible" | "unconfirmed";
} {
  if (score >= 90) return { label: "Very strong match", band: "very-strong" };
  if (score >= 75) return { label: "Strong match", band: "strong" };
  if (score >= 50) return { label: "Possible match", band: "possible" };
  return { label: "Unconfirmed", band: "unconfirmed" };
}

/**
 * Compute identity confidence from a set of independent identifier matches.
 * Each identifier contributes a weight; corroborating identifiers raise the score.
 * Never returns 100 — absolute certainty is reserved for direct official confirmation.
 */
export function computeIdentityConfidence(
  matchedIdentifiers: { name: string; weight: number; present: boolean }[],
): Confidence {
  const totalWeight = matchedIdentifiers.reduce(
    (sum, i) => sum + i.weight,
    0,
  );
  if (totalWeight === 0) return 0;
  const presentWeight = matchedIdentifiers
    .filter((i) => i.present)
    .reduce((sum, i) => sum + i.weight, 0);
  const ratio = presentWeight / totalWeight;
  // Cap at 98 — never claim 100 from inference alone.
  return Math.min(98, Math.round(ratio * 98));
}

export function contactVerificationToScore(
  v: ContactVerification,
): Confidence {
  switch (v) {
    case "VERIFIED":
      return 95;
    case "HIGH":
      return 80;
    case "MEDIUM":
      return 60;
    case "LOW":
      return 35;
    case "UNKNOWN":
      return 0;
  }
}

/**
 * Validate an email format. Does NOT verify deliverability or ownership.
 * Returns false for anything that is not a plausible professional email.
 */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Validate a plausible UAE/international phone format.
 * Does NOT verify the number is in service.
 */
export function looksLikePhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}

/**
 * Validate a LinkedIn profile URL (public form only).
 */
export function looksLikeLinkedInUrl(value: string): boolean {
  return /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|company)\/[^/?#]+/i.test(
    value.trim(),
  );
}
