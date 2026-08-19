// Repository functions: typed CRUD + search queries for the UAE Intel DB.
// Implements §12 SEARCH DATABASE and §13 FILTERS of the master prompt.

import type Database from "better-sqlite3";
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

export function insertSource(
  db: Database.Database,
  s: Omit<Source, "id">,
): number {
  const stmt = db.prepare(
    `INSERT INTO sources (url, name, source_type, reliability, date_accessed, confirms)
     VALUES (@url, @name, @source_type, @reliability, @date_accessed, @confirms)`,
  );
  return Number(stmt.run(s).lastInsertRowid);
}

export function getSource(db: Database.Database, id: number): Source | undefined {
  return db.prepare(`SELECT * FROM sources WHERE id = ?`).get(id) as
    | Source
    | undefined;
}

// ---------- Persons ----------

export function insertPerson(
  db: Database.Database,
  p: Omit<Person, "id" | "created_at" | "updated_at">,
): number {
  const stmt = db.prepare(
    `INSERT INTO persons (full_name, name_variations, current_title, location, linkedin_url, confidence_score)
     VALUES (@full_name, @name_variations, @current_title, @location, @linkedin_url, @confidence_score)`,
  );
  return Number(
    stmt.run({
      ...p,
      name_variations: JSON.stringify(p.name_variations ?? []),
    }).lastInsertRowid,
  );
}

export function getPerson(db: Database.Database, id: number): Person | undefined {
  const row = db.prepare(`SELECT * FROM persons WHERE id = ?`).get(id) as
    | (Person & { name_variations: string })
    | undefined;
  if (!row) return undefined;
  return { ...row, name_variations: JSON.parse(row.name_variations) };
}

export function findPersonsByName(
  db: Database.Database,
  name: string,
): Person[] {
  const rows = db
    .prepare(`SELECT * FROM persons WHERE lower(full_name) LIKE ? ORDER BY confidence_score DESC`)
    .all(`%${name.toLowerCase()}%`) as (Person & { name_variations: string })[];
  return rows.map((r) => ({
    ...r,
    name_variations: JSON.parse(r.name_variations),
  }));
}

// ---------- Companies ----------

export function insertCompany(
  db: Database.Database,
  c: Omit<Company, "id" | "created_at" | "updated_at">,
): number {
  const stmt = db.prepare(
    `INSERT INTO companies (legal_name, trading_name, website, domain, industry, emirate, location, confidence_score)
     VALUES (@legal_name, @trading_name, @website, @domain, @industry, @emirate, @location, @confidence_score)`,
  );
  return Number(stmt.run(c).lastInsertRowid);
}

export function getCompany(
  db: Database.Database,
  id: number,
): Company | undefined {
  return db.prepare(`SELECT * FROM companies WHERE id = ?`).get(id) as
    | Company
    | undefined;
}

export function findCompaniesByName(
  db: Database.Database,
  name: string,
): Company[] {
  return db
    .prepare(
      `SELECT * FROM companies WHERE lower(legal_name) LIKE ? OR lower(trading_name) LIKE ? ORDER BY confidence_score DESC`,
    )
    .all(`%${name.toLowerCase()}%`, `%${name.toLowerCase()}%`) as Company[];
}

// ---------- Roles ----------

export function insertRole(
  db: Database.Database,
  r: Omit<Role, "id">,
): number {
  const stmt = db.prepare(
    `INSERT INTO roles (person_id, company_id, title, start_date, end_date, source_id, confidence)
     VALUES (@person_id, @company_id, @title, @start_date, @end_date, @source_id, @confidence)`,
  );
  return Number(stmt.run(r).lastInsertRowid);
}

export function rolesForPerson(db: Database.Database, personId: number) {
  return db
    .prepare(
      `SELECT r.*, c.legal_name AS company_name
       FROM roles r JOIN companies c ON r.company_id = c.id
       WHERE r.person_id = ? ORDER BY r.end_date IS NULL DESC, r.end_date DESC`,
    )
    .all(personId);
}

export function rolesForCompany(db: Database.Database, companyId: number) {
  return db
    .prepare(
      `SELECT r.*, p.full_name AS person_name
       FROM roles r JOIN persons p ON r.person_id = p.id
       WHERE r.company_id = ? ORDER BY r.end_date IS NULL DESC, r.end_date DESC`,
    )
    .all(companyId);
}

// ---------- Contacts ----------

export function insertContact(
  db: Database.Database,
  c: Omit<Contact, "id">,
): number {
  const stmt = db.prepare(
    `INSERT INTO contacts (person_id, company_id, type, value, classification, source_id, verification, confidence, last_verified)
     VALUES (@person_id, @company_id, @type, @value, @classification, @source_id, @verification, @confidence, @last_verified)`,
  );
  return Number(stmt.run(c).lastInsertRowid);
}

export function contactsForPerson(db: Database.Database, personId: number) {
  return db.prepare(`SELECT * FROM contacts WHERE person_id = ?`).all(personId);
}

export function contactsForCompany(db: Database.Database, companyId: number) {
  return db.prepare(`SELECT * FROM contacts WHERE company_id = ?`).all(companyId);
}

// ---------- Relationships ----------

export function insertRelationship(
  db: Database.Database,
  r: Omit<Relationship, "id">,
): number {
  const stmt = db.prepare(
    `INSERT INTO relationships (person_id, related_person_id, related_company_id, relationship_type, source_id, confidence)
     VALUES (@person_id, @related_person_id, @related_company_id, @relationship_type, @source_id, @confidence)`,
  );
  return Number(stmt.run(r).lastInsertRowid);
}

export function relationshipsForPerson(db: Database.Database, personId: number) {
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
    .all(personId);
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

export function searchPersons(
  db: Database.Database,
  filters: PersonSearchFilters,
): Person[] {
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (filters.name) {
    where.push("lower(p.full_name) LIKE @name");
    params.name = `%${filters.name.toLowerCase()}%`;
  }
  if (filters.title) {
    where.push("lower(p.current_title) LIKE @title");
    params.title = `%${filters.title.toLowerCase()}%`;
  }
  if (filters.linkedin) {
    where.push("p.linkedin_url LIKE @linkedin");
    params.linkedin = `%${filters.linkedin}%`;
  }
  if (filters.minConfidence != null) {
    where.push("p.confidence_score >= @minConfidence");
    params.minConfidence = filters.minConfidence;
  }
  if (filters.company || filters.emirate || filters.industry) {
    where.push("EXISTS (SELECT 1 FROM roles r JOIN companies c ON r.company_id = c.id WHERE r.person_id = p.id");
    if (filters.company) {
      where.push("AND lower(c.legal_name) LIKE @company");
      params.company = `%${filters.company.toLowerCase()}%`;
    }
    if (filters.emirate) {
      where.push("AND c.emirate = @emirate");
      params.emirate = filters.emirate;
    }
    if (filters.industry) {
      where.push("AND c.industry = @industry");
      params.industry = filters.industry;
    }
    where.push(")");
  }
  const sql = `SELECT p.* FROM persons p ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.confidence_score DESC`;
  const rows = db.prepare(sql).all(params) as (Person & {
    name_variations: string;
  })[];
  return rows.map((r) => ({
    ...r,
    name_variations: JSON.parse(r.name_variations),
  }));
}
