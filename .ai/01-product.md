# 01 — Product Standard

## Purpose
Define what the product is, who it serves, and what success looks like — so AI agents build the right thing, not just any thing.

## Required artifacts (in `docs/PRODUCT.md`)
- Product summary (one paragraph)
- Target users / personas
- Core problems solved
- Key user journeys
- Success metrics (KPIs)
- Non-goals (explicitly out of scope)
- Constraints (regulatory, technical, business)

## AI agent responsibilities
- Read `docs/PRODUCT.md` before building user-facing features.
- If a feature contradicts the product definition, flag it and ask.
- Do not invent product requirements. If absent, label `NOT VERIFIED` and request.
- Prefer the smallest change that satisfies the user need.

## Change protocol
Product changes (new personas, new journeys, changed KPIs) require:
1. A change request (see `templates/change-request.md`).
2. Approval.
3. Update to `docs/PRODUCT.md` and `docs/CHANGELOG.md`.
