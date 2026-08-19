# 12 — Analytics Standard

## Principle
Privacy-conscious analytics. Collect what is needed; do not collect unnecessary personal information.

## Events to track
- Page views
- CTA clicks
- Conversion events
- Form submissions (success and failure)
- Search behavior
- Errors (client and server, where appropriate)
- Important business events (defined in `docs/ANALYTICS.md`)

## Rules
- Prefer anonymous/aggregated metrics over identifiable tracking.
- Obtain consent where required by law (GDPR, UAE PDPL, etc.).
- Do not log PII, secrets, or credentials in analytics.
- Document every tracked event in `docs/ANALYTICS.md` with: name, trigger, properties, purpose.

## AI agent responsibilities
- When adding a user-facing flow, add the agreed analytics events.
- Do not invent new event names; follow the documented taxonomy.
- Update `docs/ANALYTICS.md` when events change.
