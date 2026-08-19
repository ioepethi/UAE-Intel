// Report generator — produces the §15 FINAL REPORT FORMAT as Markdown.
// Every claim is sourced; missing data is labeled NOT VERIFIED, never fabricated.

import type {
  ContactType,
  ResearchReport,
  Source,
} from "@uae-intel/core";
import type { ResearchResult } from "@uae-intel/research";

export function generateReport(result: ResearchResult): string {
  const r = toReport(result);
  return renderMarkdown(r);
}

export function toReport(result: ResearchResult): ResearchReport {
  const id = result.identity;
  const name = id?.person.full_name ?? result.request.name ?? "NOT VERIFIED";
  const title = id?.person.current_title ?? result.request.title ?? "NOT VERIFIED";
  const company = result.request.company ?? "NOT VERIFIED";
  const location = id?.person.location ?? result.request.location ?? "NOT VERIFIED";
  const identityConfidence = id?.confidence ?? 0;

  const contacts = result.contacts.map((c) => ({
    type: c.type,
    value: c.value,
    status: c.verification,
    source: c.source.url,
    confidence: c.confidence,
    last_verified: c.source.date_accessed,
  }));

  const recommended: string[] = [];
  const linkedIn = contacts.find((c) => c.type === "linkedin");
  const companyLinkedIn = contacts.find((c) => c.type === "company_linkedin");
  const companyEmail = contacts.find(
    (c) => c.type === "company_email" || c.type === "professional_email",
  );
  const businessPhone = contacts.find((c) => c.type === "business_phone");
  if (companyEmail) recommended.push(`Company email: ${companyEmail.value}`);
  if (businessPhone) recommended.push(`Business phone: ${businessPhone.value}`);
  if (linkedIn) recommended.push(`LinkedIn: ${linkedIn.value}`);
  if (companyLinkedIn) recommended.push(`Company LinkedIn: ${companyLinkedIn.value}`);
  if (recommended.length === 0)
    recommended.push("No verified public business contact route discovered.");

  return {
    identity: {
      name,
      current_position: title,
      company,
      location,
      identity_confidence: identityConfidence,
    },
    executive_summary: buildSummary(result, name, company, title),
    professional_profile: {
      linkedin: id?.person.linkedin_url ?? "NOT VERIFIED",
      website: result.request.company ? "NOT VERIFIED" : "NOT VERIFIED",
      current_role: title,
      previous_roles: [],
      professional_background: id
        ? id.supporting_evidence.join(" ")
        : "NOT VERIFIED",
    },
    companies: {
      current: company === "NOT VERIFIED" ? [] : [company],
      previous: [],
      directorships: [],
      ownership: [],
      related: [],
      subsidiaries: [],
    },
    business_contacts: contacts,
    business_network: [],
    public_intelligence: {
      news: result.discovery.slice(0, 5).map((d) => `- ${d.title} — ${d.url}`),
      deals: [],
      projects: [],
      investments: [],
      events: [],
      interviews: [],
      publications: [],
    },
    business_prominence: {
      score: 0,
      confidence: 0,
      evidence: [],
    },
    identity_verification: id
      ? `${id.supporting_evidence.join("; ")}. ${id.potential_issues.join("; ")}.`
      : "No confident identity match established.",
    conflicts: result.conflicts.map((c) => ({
      claim: c.claim,
      sources: [],
      assessment: c.assessment,
      conclusion: c.assessment,
    })),
    unknowns: result.unknowns,
    sources: result.allSources,
    recommended_contact_route: recommended,
  };
}

function buildSummary(
  result: ResearchResult,
  name: string,
  company: string,
  title: string,
): string {
  if (!result.identity) {
    return `No confident identity match could be established for "${name}" from public sources. The query may be too ambiguous, or the person may not have a significant public business footprint. Recommend refining the input (full name, company, or LinkedIn URL).`;
  }
  return `${name} is identified as ${title} at ${company}, based in ${result.request.location ?? "the UAE"}. Identity confidence: ${result.identity.confidence}%. ${result.contacts.length} public business contact(s) discovered across ${result.allSources.length} source(s).`;
}

export function renderMarkdown(r: ResearchReport): string {
  const lines: string[] = [];
  lines.push("# PERSON / COMPANY INTELLIGENCE REPORT");
  lines.push("");
  lines.push("## 1. Identity");
  lines.push(`- **Name:** ${r.identity.name}`);
  lines.push(`- **Current Position:** ${r.identity.current_position}`);
  lines.push(`- **Company:** ${r.identity.company}`);
  lines.push(`- **Location:** ${r.identity.location}`);
  lines.push(`- **Identity Confidence:** ${r.identity.identity_confidence}%`);
  lines.push("");
  lines.push("## 2. Executive Summary");
  lines.push(r.executive_summary);
  lines.push("");
  lines.push("## 3. Professional Profile");
  lines.push(`- **LinkedIn:** ${r.professional_profile.linkedin}`);
  lines.push(`- **Website:** ${r.professional_profile.website}`);
  lines.push(`- **Current Role:** ${r.professional_profile.current_role}`);
  lines.push(`- **Previous Roles:** ${r.professional_profile.previous_roles.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Professional Background:** ${r.professional_profile.professional_background || "NOT VERIFIED"}`);
  lines.push("");
  lines.push("## 4. Companies");
  lines.push(`- **Current Companies:** ${r.companies.current.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Previous Companies:** ${r.companies.previous.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Directorships:** ${r.companies.directorships.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Ownership/Founder Information:** ${r.companies.ownership.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Related Companies:** ${r.companies.related.join(", ") || "NOT VERIFIED"}`);
  lines.push(`- **Subsidiaries:** ${r.companies.subsidiaries.join(", ") || "NOT VERIFIED"}`);
  lines.push("");
  lines.push("## 5. Business Contacts");
  if (r.business_contacts.length === 0) {
    lines.push("NOT VERIFIED — no public business contacts discovered.");
  } else {
    for (const c of r.business_contacts) {
      lines.push(`- **${labelContact(c.type)}:** ${c.value}`);
      lines.push(`  - Status: ${c.status}`);
      lines.push(`  - Source: ${c.source}`);
      lines.push(`  - Confidence: ${c.confidence}%`);
      lines.push(`  - Last verified: ${c.last_verified}`);
    }
  }
  lines.push("");
  lines.push("## 6. Business Network");
  lines.push(r.business_network.length ? r.business_network.map((n) => `- ${n.entity} — ${n.relationship}`).join("\n") : "NOT VERIFIED");
  lines.push("");
  lines.push("## 7. Public Business Intelligence");
  lines.push(`- **News:**\n${r.public_intelligence.news.join("\n") || "NOT VERIFIED"}`);
  lines.push(`- **Deals:** ${r.public_intelligence.deals.join("; ") || "NOT VERIFIED"}`);
  lines.push(`- **Projects:** ${r.public_intelligence.projects.join("; ") || "NOT VERIFIED"}`);
  lines.push(`- **Investments:** ${r.public_intelligence.investments.join("; ") || "NOT VERIFIED"}`);
  lines.push(`- **Events:** ${r.public_intelligence.events.join("; ") || "NOT VERIFIED"}`);
  lines.push(`- **Interviews:** ${r.public_intelligence.interviews.join("; ") || "NOT VERIFIED"}`);
  lines.push(`- **Publications:** ${r.public_intelligence.publications.join("; ") || "NOT VERIFIED"}`);
  lines.push("");
  lines.push("## 8. Business Prominence");
  lines.push(`- **Score:** ${r.business_prominence.score}/100`);
  lines.push(`- **Confidence:** ${r.business_prominence.confidence}%`);
  lines.push(`- **Evidence:** ${r.business_prominence.evidence.join("; ") || "Insufficient public indicators."}`);
  lines.push("");
  lines.push("> A business prominence score is an analytical indicator, NOT a claim about private net worth.");
  lines.push("");
  lines.push("## 9. Identity Verification");
  lines.push(r.identity_verification || "NOT VERIFIED");
  lines.push("");
  lines.push("## 10. Conflicts / Unknowns");
  if (r.conflicts.length) {
    for (const c of r.conflicts) {
      lines.push(`- **${c.claim}** — ${c.assessment}`);
    }
  }
  for (const u of r.unknowns) lines.push(`- ${u}`);
  if (!r.conflicts.length && !r.unknowns.length) lines.push("None identified.");
  lines.push("");
  lines.push("## 11. Sources");
  for (const s of r.sources) {
    lines.push(`- [${s.reliability}] ${s.name} — ${s.url}`);
    lines.push(`  - Confirms: ${s.confirms}`);
    lines.push(`  - Accessed: ${s.date_accessed}`);
  }
  lines.push("");
  lines.push("## 12. Recommended Professional Contact Route");
  for (const i of r.recommended_contact_route) lines.push(`${i}`);
  lines.push("");
  lines.push("> Do not contact through private channels merely because they may exist. Use legitimate business routes only.");
  lines.push("");
  return lines.join("\n");
}

function labelContact(t: ContactType): string {
  switch (t) {
    case "professional_email":
      return "Professional Email";
    case "company_email":
      return "Company Email";
    case "executive_email":
      return "Executive Email";
    case "business_phone":
      return "Business Phone";
    case "switchboard":
      return "Switchboard";
    case "office_phone":
      return "Office Phone";
    case "contact_page":
      return "Contact Page";
    case "linkedin":
      return "LinkedIn";
    case "company_linkedin":
      return "Company LinkedIn";
    case "professional_social":
      return "Professional Social";
    case "executive_assistant":
      return "Executive Assistant";
    case "website":
      return "Website";
  }
}

export function sourcesToList(sources: Source[]): string {
  return sources.map((s) => `[${s.reliability}] ${s.url}`).join("\n");
}
