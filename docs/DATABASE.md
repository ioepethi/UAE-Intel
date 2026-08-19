# DATABASE

> Schema and data model. See `.ai/03-architecture.md` and ADR-0003.

## Engine
SQLite via better-sqlite3. Single file: `uae-intel.sqlite` (configurable via `DATABASE_URL`).

## Schema overview
6 tables mirroring §11 of the master prompt:

- **persons** — full_name, name_variations (JSON), current_title, location, linkedin_url, confidence_score
- **companies** — legal_name, trading_name, website, domain, industry, emirate, location, confidence_score
- **sources** — url, name, source_type, reliability (A–E), date_accessed, confirms
- **roles** — person_id ↔ company_id, title, start_date, end_date, source_id, confidence
- **contacts** — person_id and/or company_id, type, value, classification, source_id, verification, confidence, last_verified
- **relationships** — person_id → related_person_id and/or related_company_id, relationship_type, source_id, confidence

## Migrations
Idempotent `CREATE TABLE IF NOT EXISTS` statements. Run via `npm run db:push`.

## Indexing
- `idx_persons_name_lower` — case-insensitive name search
- `idx_companies_name_lower` — case-insensitive company name search
- `idx_companies_domain` — domain lookup
- `idx_roles_person`, `idx_roles_company` — role lookups
- `idx_contacts_person`, `idx_contacts_company` — contact lookups
- `idx_relationships_person` — relationship lookups

## Data classification
- **Public:** company names, websites, public executive names, public titles, public business contacts.
- **Sensitive:** none collected (no private PII, no personal mobiles, no private emails).
- All contacts are classified `public` with a recorded source.
