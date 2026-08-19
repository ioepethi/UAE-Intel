// Repository functions: typed CRUD + search queries for the UAE Intel DB.
// Implements §12 SEARCH DATABASE and §13 FILTERS of the master prompt.
// All functions are async and use the unified DbClient (better-sqlite3 or D1).

import type { DbClient } from "./client.js";
import type {
  Company,
  Contact,
  Emirate,
  Industry,
  Person,
  Relationship,
  Role,
  Source,
} from "@uae-intel/core";

// ---------- Sources ----------

export async function insertSource(
  db: DbClient,
  s: Omit<Source, "id">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO sources (url, name, source_type, reliability, date_accessed, confirms)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(s.url, s.name, s.source_type, s.reliability, s.date_accessed, s.confirms)
    .run();
  return res.meta.last_row_id;
}

export async function getSource(db: DbClient, id: number): Promise<Source | undefined> {
  return db.prepare(`SELECT * FROM sources WHERE id = ?`).bind(id).first<Source>();
}

// ---------- Persons ----------

export async function insertPerson(
  db: DbClient,
  p: Omit<Person, "id" | "created_at" | "updated_at">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO persons (full_name, name_variations, current_title, location, linkedin_url, confidence_score)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      p.full_name,
      JSON.stringify(p.name_variations ?? []),
      p.current_title ?? null,
      p.location ?? null,
      p.linkedin_url ?? null,
      p.confidence_score,
    )
    .run();
  return res.meta.last_row_id;
}

export async function getPerson(db: DbClient, id: number): Promise<Person | undefined> {
  const row = await db
    .prepare(`SELECT * FROM persons WHERE id = ?`)
    .bind(id)
    .first<Person & { name_variations: string }>();
  if (!row) return undefined;
  return { ...row, name_variations: JSON.parse(row.name_variations) };
}

export async function findPersonsByName(
  db: DbClient,
  name: string,
): Promise<Person[]> {
  const rows = await db
    .prepare(
      `SELECT * FROM persons WHERE lower(full_name) LIKE ? ORDER BY confidence_score DESC`,
    )
    .bind(`%${name.toLowerCase()}%`)
    .all<Person & { name_variations: string }>();
  return rows.map((r) => ({
    ...r,
    name_variations: JSON.parse(r.name_variations),
  }));
}

// ---------- Companies ----------

export async function insertCompany(
  db: DbClient,
  c: Omit<Company, "id" | "created_at" | "updated_at">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO companies (legal_name, trading_name, website, domain, industry, emirate, location, confidence_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      c.legal_name,
      c.trading_name ?? null,
      c.website ?? null,
      c.domain ?? null,
      c.industry ?? null,
      c.emirate ?? null,
      c.location ?? null,
      c.confidence_score,
    )
    .run();
  return res.meta.last_row_id;
}

export async function getCompany(
  db: DbClient,
  id: number,
): Promise<Company | undefined> {
  return db.prepare(`SELECT * FROM companies WHERE id = ?`).bind(id).first<Company>();
}

export async function findCompaniesByName(
  db: DbClient,
  name: string,
): Promise<Company[]> {
  const like = `%${name.toLowerCase()}%`;
  return db
    .prepare(
      `SELECT * FROM companies WHERE lower(legal_name) LIKE ? OR lower(trading_name) LIKE ? ORDER BY confidence_score DESC`,
    )
    .bind(like, like)
    .all<Company>();
}

// ---------- Roles ----------

export async function insertRole(
  db: DbClient,
  r: Omit<Role, "id">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO roles (person_id, company_id, title, start_date, end_date, source_id, confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      r.person_id,
      r.company_id,
      r.title,
      r.start_date ?? null,
      r.end_date ?? null,
      r.source_id,
      r.confidence,
    )
    .run();
  return res.meta.last_row_id;
}

export async function rolesForPerson(db: DbClient, personId: number) {
  return db
    .prepare(
      `SELECT r.*, c.legal_name AS company_name
       FROM roles r JOIN companies c ON r.company_id = c.id
       WHERE r.person_id = ? ORDER BY r.end_date IS NULL DESC, r.end_date DESC`,
    )
    .bind(personId)
    .all();
}

export async function rolesForCompany(db: DbClient, companyId: number) {
  return db
    .prepare(
      `SELECT r.*, p.full_name AS person_name
       FROM roles r JOIN persons p ON r.person_id = p.id
       WHERE r.company_id = ? ORDER BY r.end_date IS NULL DESC, r.end_date DESC`,
    )
    .bind(companyId)
    .all();
}

// ---------- Contacts ----------

export async function insertContact(
  db: DbClient,
  c: Omit<Contact, "id">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO contacts (person_id, company_id, type, value, classification, source_id, verification, confidence, last_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      c.person_id ?? null,
      c.company_id ?? null,
      c.type,
      c.value,
      c.classification,
      c.source_id,
      c.verification,
      c.confidence,
      c.last_verified,
    )
    .run();
  return res.meta.last_row_id;
}

export async function contactsForPerson(db: DbClient, personId: number) {
  return db.prepare(`SELECT * FROM contacts WHERE person_id = ?`).bind(personId).all();
}

export async function contactsForCompany(db: DbClient, companyId: number) {
  return db.prepare(`SELECT * FROM contacts WHERE company_id = ?`).bind(companyId).all();
}

// ---------- Relationships ----------

export async function insertRelationship(
  db: DbClient,
  r: Omit<Relationship, "id">,
): Promise<number> {
  const res = await db
    .prepare(
      `INSERT INTO relationships (person_id, related_person_id, related_company_id, relationship_type, source_id, confidence)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      r.person_id,
      r.related_person_id ?? null,
      r.related_company_id ?? null,
      r.relationship_type,
      r.source_id,
      r.confidence,
    )
    .run();
  return res.meta.last_row_id;
}

export async function relationshipsForPerson(db: DbClient, personId: number) {
  return db
    .prepare(
      `SELECT rel.*,
              p2.full_name AS related_person_name,
              c.legal_name  AS related_company_name
       FROM relationships rel
       LEFT JOIN persons p2 ON rel.related_person_id = p2.id
       LEFT JOIN companies c ON rel.related_company_id = c.id
       WHERE rel.person_id = ?`,
    )
    .bind(personId)
    .all();
}

// ---------- Filtered search (§13) ----------

export interface PersonSearchFilters {
  name?: string;
  title?: string;
  company?: string;
  emirate?: Emirate;
  industry?: Industry;
  linkedin?: string;
  minConfidence?: number;
}

export async function searchPersons(
  db: DbClient,
  filters: PersonSearchFilters,
): Promise<Person[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.name) {
    where.push("lower(p.full_name) LIKE ?");
    params.push(`%${filters.name.toLowerCase()}%`);
  }
  if (filters.title) {
    where.push("lower(p.current_title) LIKE ?");
    params.push(`%${filters.title.toLowerCase()}%`);
  }
  if (filters.linkedin) {
    where.push("p.linkedin_url LIKE ?");
    params.push(`%${filters.linkedin}%`);
  }
  if (filters.minConfidence != null) {
    where.push("p.confidence_score >= ?");
    params.push(filters.minConfidence);
  }
  if (filters.company || filters.emirate || filters.industry) {
    where.push(
      "EXISTS (SELECT 1 FROM roles r JOIN companies c ON r.company_id = c.id WHERE r.person_id = p.id",
    );
    if (filters.company) {
      where.push("AND lower(c.legal_name) LIKE ?");
      params.push(`%${filters.company.toLowerCase()}%`);
    }
    if (filters.emirate) {
      where.push("AND c.emirate = ?");
      params.push(filters.emirate);
    }
    if (filters.industry) {
      where.push("AND c.industry = ?");
      params.push(filters.industry);
    }
    where.push(")");
  }
  const sql = `SELECT p.* FROM persons p ${where.length ? "WHERE " + where.join(" AND ") : ""
    } ORDER BY p.confidence_score DESC`;
  const rows = await db
    .prepare(sql)
    .bind(...params)
    .all<Person & { name_variations: string }>();
  return rows.map((r) => ({
    ...r,
    name_variations: JSON.parse(r.name_variations),
  }));
}
