# ARCHITECTURE

> System architecture for the UAE Intelligence system.

## System diagram
```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   CLI app   │────▶│  @uae-intel/research │────▶│   Tavily API │
│ (Commander) │     │  (research engine)   │     └──────────────┘
└─────────────┘     └──────────┬───────────┘     ┌──────────────┐
                               │                 │  Web fetch   │
┌─────────────┐                ├────────────────▶│ (company sites)│
│   Web app   │────▶           │                 └──────────────┘
│  (Next.js)  │                │
└─────────────┘     ┌──────────▼───────────┐
                    │  @uae-intel/report   │
                    │  (report generator)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   @uae-intel/db      │
                    │  (SQLite + repo)     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  @uae-intel/core     │
                    │  (types, confidence) │
                    └──────────────────────┘
```

## Frontend
- Next.js (App Router) with React Server Components.
- Dashboard: search, filters (§13), entity profiles, knowledge graph (react-flow), report viewer, export.

## Backend
- Next.js API routes (Route Handlers) for web.
- CLI runs the research engine directly.
- Both share `@uae-intel/research`, `@uae-intel/db`, `@uae-intel/report`.

## Database
- SQLite via better-sqlite3 (single file: `uae-intel.sqlite`).
- 6 tables: persons, companies, roles, contacts, sources, relationships.
- See `docs/DATABASE.md`.

## APIs
- Next.js API routes:
  - `POST /api/research` — run a research request.
  - `GET /api/persons` — search persons (§12/§13 filters).
  - `GET /api/persons/:id` — person profile with roles, contacts, relationships.
  - `GET /api/companies` — search companies.
  - `GET /api/companies/:id` — company profile.
  - `GET /api/export/:type/:id` — export entity as CSV/JSON.

## Authentication & authorization
- None in v1.0 (local/single-user). Documented as a v1.1 addition.

## External services
- Tavily Search API (key via `TAVILY_API_KEY` env var).

## Logging & monitoring
- Console output for CLI. Next.js standard logging for web.
- No secrets or PII logged (security standard §07).
