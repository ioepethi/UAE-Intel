# DECISIONS — Architecture Decision Records

> See `.ai/03-architecture.md`. Significant technical decisions are recorded here.

## ADR format
```text
Decision:
Date:
Context:
Options:
Decision:
Reason:
Consequences:
Status: Proposed | Accepted | Superseded | Deprecated
```

## ADR-0001 — Monorepo with npm workspaces
- **Decision:** Use a single Git repository with npm workspaces.
- **Date:** 2026-08-19
- **Context:** The system has a CLI, a web app, and four shared packages (core, db, research, report). Sharing types and code across them is essential.
- **Options:** (a) npm workspaces (built-in), (b) pnpm workspaces, (c) separate repos with npm packages.
- **Decision:** npm workspaces.
- **Reason:** Built into Node, no extra tooling to install. pnpm was attempted but global install hit a permissions issue on this machine. Separate repos add publishing overhead for a single-team project.
- **Consequences:** One `node_modules` at the root; `npm install` from root installs everything. Packages reference each other via `@uae-intel/*` names with `"*"` version ranges.
- **Status:** Accepted

## ADR-0002 — CLI with Commander.js, Web with Next.js
- **Decision:** CLI uses Commander.js; web dashboard uses Next.js (App Router).
- **Date:** 2026-08-19
- **Context:** Need a CLI for terminal research operations and a web UI for browsing the knowledge graph and reports.
- **Options:** (a) Commander + Next.js, (b) oclif + Vite, (c) yargs + Remix.
- **Decision:** Commander + Next.js.
- **Reason:** Commander is the most widely used, well-maintained CLI framework for Node. Next.js provides SSR, routing, and API routes out of the box, matching the standard's "boring, proven" rule.
- **Consequences:** Two entry points share the same `@uae-intel/research` and `@uae-intel/db` packages.
- **Status:** Accepted

## ADR-0003 — SQLite via better-sqlite3, no ORM
- **Decision:** Use SQLite via better-sqlite3 with hand-written SQL, no ORM.
- **Date:** 2026-08-19
- **Context:** Single-user/local system, small stable schema (6 tables per §11). Need zero-config deployment.
- **Options:** (a) SQLite + better-sqlite3 (no ORM), (b) SQLite + Drizzle ORM, (c) PostgreSQL + Prisma.
- **Decision:** SQLite + better-sqlite3, no ORM.
- **Reason:** Schema is small and stable; raw SQL is clearer than an ORM layer for 6 tables. SQLite is a single file — zero config. PostgreSQL was rejected as overkill for a local/single-user system.
- **Consequences:** Migrations are idempotent `CREATE TABLE IF NOT EXISTS` statements. No ORM query builder; repo functions are typed wrappers around prepared statements.
- **Status:** Accepted

## ADR-0004 — Pluggable search provider, Tavily default
- **Decision:** Define a `SearchProvider` interface; default implementation is Tavily.
- **Date:** 2026-08-19
- **Context:** The research engine needs web search. Different users may have different search API keys.
- **Options:** (a) hardcode Tavily, (b) pluggable interface with Tavily default, (c) use a free search API.
- **Decision:** Pluggable interface with Tavily default.
- **Reason:** Avoids vendor lock-in; allows adding Serper/Brave later by implementing the interface. Tavily is designed for AI agents and returns clean content + sources.
- **Consequences:** API key is read from `TAVILY_API_KEY` env var (never hardcoded, per security standard). Other providers can be added without touching the engine.
- **Status:** Accepted

## ADR-0005 — Public-data-only research, no auth bypass
- **Decision:** The research engine only accesses publicly available data. It does not bypass authentication, scrape private LinkedIn, or access leaked/stolen datasets.
- **Date:** 2026-08-19
- **Context:** The master prompt explicitly prohibits obtaining leaked databases, bypassing privacy controls, circumventing authentication, and fabricating contact details.
- **Options:** (a) public-data-only with explicit guardrails, (b) aggressive scraping including auth bypass.
- **Decision:** Public-data-only with explicit guardrails.
- **Reason:** Legal and ethical compliance. The system is for legitimate business research, not surveillance.
- **Consequences:** Some data will be unavailable and labeled `NOT VERIFIED`. The fetcher respects rate limits and uses an honest user-agent. LinkedIn data is limited to public profiles.
- **Status:** Accepted
