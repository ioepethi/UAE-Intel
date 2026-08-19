# UAE Intelligence System — CHANGELOG

## [1.0.0] — 2026-08-19
### Added
- Monorepo with npm workspaces (ADR-0001).
- `@uae-intel/core` — shared domain types (§11), confidence scoring (§5/§6), source tracking (§9).
- `@uae-intel/db` — SQLite via better-sqlite3, 6-table schema (§11), repository with search (§12/§13).
- `@uae-intel/research` — research engine (§4 phases 1–6), Tavily provider (ADR-0004), polite HTML fetcher, extractors, identity resolution.
- `@uae-intel/report` — §15 report generator (Markdown output).
- `@uae-intel/cli` — Commander.js CLI with §17 commands: `find person`, `find ceo`, `find directors`, `find executives`, `deep-research`, `research <linkedin-url>`, `search`.
- `@uae-intel/web` — Next.js dashboard with search, filters, person/company profiles, research form, JSON export.
- 5 ADRs recorded in `docs/DECISIONS.md`.
- 7 unit tests for confidence scoring (all passing).
- Public-data-only guardrails enforced in code (ADR-0005).
