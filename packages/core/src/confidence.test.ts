// Unit tests for confidence scoring — §5/§6 of the master prompt.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyIdentityConfidence,
  computeIdentityConfidence,
  contactVerificationToScore,
  looksLikeEmail,
  looksLikePhone,
  looksLikeLinkedInUrl,
} from "./confidence.js";

test("classifyIdentityConfidence bands", () => {
  assert.equal(classifyIdentityConfidence(94).band, "very-strong");
  assert.equal(classifyIdentityConfidence(80).band, "strong");
  assert.equal(classifyIdentityConfidence(60).band, "possible");
  assert.equal(classifyIdentityConfidence(30).band, "unconfirmed");
});

test("computeIdentityConfidence never exceeds 98 from inference", () => {
  const all = [
    { name: "name", weight: 30, present: true },
    { name: "company", weight: 25, present: true },
    { name: "title", weight: 15, present: true },
    { name: "location", weight: 10, present: true },
    { name: "linkedin", weight: 20, present: true },
  ];
  assert.equal(computeIdentityConfidence(all), 98);
});

test("computeIdentityConfidence returns 0 when nothing matches", () => {
  const none = [{ name: "x", weight: 10, present: false }];
  assert.equal(computeIdentityConfidence(none), 0);
});

test("contactVerificationToScore maps correctly", () => {
  assert.equal(contactVerificationToScore("VERIFIED"), 95);
  assert.equal(contactVerificationToScore("HIGH"), 80);
  assert.equal(contactVerificationToScore("MEDIUM"), 60);
  assert.equal(contactVerificationToScore("LOW"), 35);
  assert.equal(contactVerificationToScore("UNKNOWN"), 0);
});

test("looksLikeEmail accepts valid, rejects junk", () => {
  assert.ok(looksLikeEmail("ceo@company.ae"));
  assert.ok(looksLikeEmail("john.doe@example.com"));
  assert.ok(!looksLikeEmail("not-an-email"));
  assert.ok(!looksLikeEmail("@nope.com"));
});

test("looksLikePhone accepts UAE and international", () => {
  assert.ok(looksLikePhone("+971 4 123 4567"));
  assert.ok(looksLikePhone("+1 (555) 123-4567"));
  assert.ok(!looksLikePhone("123"));
});

test("looksLikeLinkedInUrl validates public profile URLs", () => {
  assert.ok(looksLikeLinkedInUrl("https://www.linkedin.com/in/johndoe"));
  assert.ok(looksLikeLinkedInUrl("https://linkedin.com/company/emaar"));
  assert.ok(!looksLikeLinkedInUrl("https://example.com/in/johndoe"));
});
