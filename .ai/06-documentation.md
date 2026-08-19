# 06 — Documentation Standard

## Principle
Documentation explains WHY, WHAT, and HOW.

## WHY
Why the feature exists — the user or business problem.

## WHAT
What the feature does — behavior, inputs, outputs, edge cases.

## HOW
How it is implemented — architecture, key files, data flow, dependencies.

## When to update documentation
Update whenever there is a meaningful change to:
- Architecture
- APIs
- Database
- Security
- Deployment
- User behavior
- Important business logic

## Required docs (in `docs/`)
- `PRODUCT.md` — product definition
- `DESIGN.md` — design system
- `ARCHITECTURE.md` — system architecture
- `COMPONENTS.md` — component catalog
- `API.md` — API reference
- `DATABASE.md` — schema and data model
- `SECURITY.md` — security model and controls
- `TESTING.md` — testing strategy
- `DEPLOYMENT.md` — deployment process
- `SEO.md` — SEO strategy (web projects)
- `ANALYTICS.md` — analytics plan
- `DECISIONS.md` — ADRs
- `CHANGELOG.md` — change history

## AI agent responsibilities
- Update the relevant doc(s) as part of the same change that touches code.
- Do not let docs drift from code.
- Prefer concise, accurate docs over verbose docs.
- Record ADRs for significant decisions.
