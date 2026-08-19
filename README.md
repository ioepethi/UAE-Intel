# UAE Intelligence System

> A business intelligence research system for identifying UAE companies, executives, founders, directors, and decision-makers. Maps business relationships, finds legitimate public business contacts, and produces fully-sourced intelligence reports with confidence scoring.

Built under the **Professional AI-Native Development Standard v1.0.0** (see `AGENTS.md` and `.ai/`).

## Quick start

### 1. Configure environment
```bash
cp .env.example .env
# Add your Tavily API key to .env (get one at https://app.tavily.com)
```

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize the database
```bash
npm run db:push
```

### 4. Build all packages
```bash
npm run build
```

### 5. Run the CLI
```bash
# Find a person
node apps/cli/dist/index.js find person "Mohammed Al-Falasi" --company "Emaar"

# Find the CEO of a company
node apps/cli/dist/index.js find ceo "Dubai Holdings"

# Deep research
node apps/cli/dist/index.js deep-research "Ahmed bin Saeed" --out report.md

# Search the local DB
node apps/cli/dist/index.js search --name "Mohammed" --emirate Dubai
```

### 6. Run the web dashboard
```bash
npm run web:dev
# Open http://localhost:3000
```

## CLI commands (§17)

| Command | Description |
|---------|-------------|
| `find person <name>` | Find a person by name (options: `--company`, `--title`, `--location`, `--linkedin`, `--industry`, `--depth`, `--out`) |
| `find ceo <company>` | Find the CEO of a company |
| `find directors <company>` | Find directors of a company |
| `find executives <company>` | Find executives of a company |
| `deep-research <name>` | Deep research a person (DEEP depth) |
| `research <url>` | Research a public LinkedIn URL |
| `search` | Search the local database (options: `--name`, `--title`, `--company`, `--emirate`, `--industry`, `--min-confidence`) |

## Research depth (§14)

| Depth | Queries | Use case |
|-------|---------|----------|
| QUICK | 3 | Quick identification |
| STANDARD | 6 | Default — multiple sources, identity resolution |
| DEEP | 10 | Extensive company research, directorships, network |
| DUE DILIGENCE | 14 | Maximum lawful/public research |

## Architecture

```
apps/
├── cli/          # Commander.js CLI
└── web/          # Next.js dashboard
packages/
├── core/         # Types, confidence scoring, source tracking
├── db/           # SQLite + repository (§11 schema)
├── research/     # Research engine (§4 phases), Tavily, fetcher, extractors
└── report/       # §15 report generator
```

See `docs/ARCHITECTURE.md` for the full system diagram and `docs/DECISIONS.md` for ADRs.

## Privacy & data rules

This system collects **only publicly available** business information. It does NOT:
- Bypass authentication or access private LinkedIn profiles
- Obtain leaked, stolen, or hacked datasets
- Fabricate contact details
- Expose private personal information

See ADR-0005 in `docs/DECISIONS.md`.

## Tests
```bash
npm test --workspace @uae-intel/core
```

## Project structure
This project inherits the Professional AI-Native Development Standard. See:
- `AGENTS.md` — AI development constitution
- `.ai/` — 16 standards (core rules, design, architecture, coding, security, testing, etc.)
- `docs/` — project documentation (PRODUCT, ARCHITECTURE, DATABASE, DECISIONS, etc.)
- `templates/` — feature requests, change requests, ADRs, bug reports, code reviews
