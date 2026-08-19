// Persist bulk discovery / research results into the DB so they become
// browsable (Persons/Companies pages) and clickable (for the history panel).
// Runs in the background (see getWaitUntil in ./server.ts) — never blocks
// the API response, and never throws.

import type { DbClient } from "@uae-intel/db";
import {
  findPersonsByName,
  findCompaniesByName,
  insertPerson,
  insertCompany,
  insertSource,
  insertRole,
  contactsForPerson,
  insertContact,
} from "@uae-intel/db";
import type { Contact, ContactCandidate, IdentityCandidate, Source } from "@uae-intel/core";

export interface PersistablePerson {
  name: string;
  name_variations: string[];
  title: string | null;
  company: string | null;
  industry: string | null;
  emirate: string | null;
  location: string | null;
  linkedin_url: string | null;
  company_website: string | null;
  business_phone: string | null;
  company_email: string | null;
  confidence: number;
  sources: Source[];
}

/** Persist a batch of discovered people (and their companies/contacts). Best-effort. */
export async function persistDiscoveredPeople(
  db: DbClient,
  people: PersistablePerson[],
): Promise<void> {
  for (const p of people) {
    try {
      await persistOnePerson(db, p);
    } catch {
      // Never let one bad record stop the batch — this runs in the
      // background and has no user-facing error surface.
    }
  }
}

async function persistOnePerson(db: DbClient, p: PersistablePerson): Promise<void> {
  // Find or create the company.
  let companyId: number | undefined;
  if (p.company) {
    const matches = await findCompaniesByName(db, p.company);
    const exact = matches.find((c) => c.legal_name.toLowerCase() === p.company!.toLowerCase());
    companyId =
      exact?.id ??
      (await insertCompany(db, {
        legal_name: p.company,
        trading_name: null,
        website: p.company_website,
        domain: null,
        industry: p.industry as never,
        emirate: p.emirate as never,
        location: p.location,
        confidence_score: p.confidence,
      }));
  }

  // Find or create the person.
  const existingPersons = await findPersonsByName(db, p.name);
  const exactPerson = existingPersons.find((x) => x.full_name.toLowerCase() === p.name.toLowerCase());
  const personId =
    exactPerson?.id ??
    (await insertPerson(db, {
      full_name: p.name,
      name_variations: p.name_variations,
      current_title: p.title,
      location: p.location,
      linkedin_url: p.linkedin_url,
      confidence_score: p.confidence,
    }));
  if (!personId) return;

  // A single representative source is enough for provenance without
  // multiplying DB writes per person.
  const src = p.sources[0];
  const sourceId = src ? await insertSource(db, src) : null;
  if (!sourceId) return;

  if (companyId && p.title) {
    await insertRole(db, {
      person_id: personId,
      company_id: companyId,
      title: p.title,
      start_date: null,
      end_date: null,
      source_id: sourceId,
      confidence: p.confidence,
    });
  }

  const existingContacts = exactPerson
    ? ((await contactsForPerson(db, personId)) as Array<{ type: string; value: string }>)
    : [];
  const hasContact = (type: string, value: string) =>
    existingContacts.some((c) => c.type === type && c.value.toLowerCase() === value.toLowerCase());

  if (p.business_phone && !hasContact("business_phone", p.business_phone)) {
    await insertContact(db, {
      person_id: personId,
      company_id: companyId ?? null,
      type: "business_phone",
      value: p.business_phone,
      classification: "public",
      source_id: sourceId,
      verification: "MEDIUM",
      confidence: 55,
      last_verified: new Date().toISOString(),
    });
  }
  if (p.company_email && !hasContact("company_email", p.company_email)) {
    await insertContact(db, {
      person_id: personId,
      company_id: companyId ?? null,
      type: "company_email",
      value: p.company_email,
      classification: "public",
      source_id: sourceId,
      verification: "MEDIUM",
      confidence: 60,
      last_verified: new Date().toISOString(),
    });
  }
  if (p.linkedin_url && !hasContact("linkedin", p.linkedin_url)) {
    await insertContact(db, {
      person_id: personId,
      company_id: companyId ?? null,
      type: "linkedin",
      value: p.linkedin_url,
      classification: "public",
      source_id: sourceId,
      verification: "HIGH",
      confidence: 80,
      last_verified: new Date().toISOString(),
    });
  }
}

/** Persist the result of a single-person Deep Research run. Best-effort. */
export async function persistResearchResult(
  db: DbClient,
  identity: IdentityCandidate | null,
  contacts: ContactCandidate[],
  request: { company?: string; title?: string },
): Promise<void> {
  if (!identity?.person?.full_name) return;
  try {
    const name = identity.person.full_name;

    let companyId: number | undefined;
    if (request.company) {
      const matches = await findCompaniesByName(db, request.company);
      const exact = matches.find((c) => c.legal_name.toLowerCase() === request.company!.toLowerCase());
      companyId =
        exact?.id ??
        (await insertCompany(db, {
          legal_name: request.company,
          trading_name: null,
          website: null,
          domain: null,
          industry: null,
          emirate: null,
          location: identity.person.location ?? null,
          confidence_score: identity.confidence,
        }));
    }

    const existingPersons = await findPersonsByName(db, name);
    const exactPerson = existingPersons.find((x) => x.full_name.toLowerCase() === name.toLowerCase());
    const personId =
      exactPerson?.id ??
      (await insertPerson(db, {
        full_name: name,
        name_variations: identity.person.name_variations ?? [],
        current_title: identity.person.current_title ?? request.title ?? null,
        location: identity.person.location ?? null,
        linkedin_url: identity.person.linkedin_url ?? null,
        confidence_score: identity.confidence,
      }));
    if (!personId) return;

    const src = identity.sources[0] ?? contacts[0]?.source;
    const sourceId = src ? await insertSource(db, src) : null;
    if (!sourceId) return;

    if (companyId && request.title) {
      await insertRole(db, {
        person_id: personId,
        company_id: companyId,
        title: request.title,
        start_date: null,
        end_date: null,
        source_id: sourceId,
        confidence: identity.confidence,
      });
    }

    const existingContacts = exactPerson
      ? ((await contactsForPerson(db, personId)) as Array<{ type: string; value: string }>)
      : [];
    const hasContact = (type: string, value: string) =>
      existingContacts.some((c) => c.type === type && c.value.toLowerCase() === value.toLowerCase());

    for (const c of contacts) {
      if (hasContact(c.type, c.value)) continue;
      const contactSourceId = c.source ? (await insertSource(db, c.source)) : sourceId;
      await insertContact(db, {
        person_id: personId,
        company_id: companyId ?? null,
        type: c.type as Contact["type"],
        value: c.value,
        classification: c.classification,
        source_id: contactSourceId,
        verification: c.verification,
        confidence: c.confidence,
        last_verified: new Date().toISOString(),
      });
    }
  } catch {
    // Best-effort — never surfaced to the user.
  }
}
