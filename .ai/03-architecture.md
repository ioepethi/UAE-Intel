# 03 — Architecture Standard

## Principle
Separation of concerns. Each module has one reason to change. Dependencies point in one direction (toward stable abstractions).

## Required documentation (`docs/ARCHITECTURE.md`)
- System diagram (components and data flow)
- Frontend architecture
- Backend architecture
- Database architecture
- API architecture
- Authentication / authorization model
- Storage strategy
- External services and integrations
- AI services (if any)
- Infrastructure
- Deployment topology
- Logging and monitoring strategy

## Mandatory rules
- Document significant architectural decisions as ADRs in `docs/DECISIONS.md`.
- No silent architectural changes. Explain and get approval first.
- Prefer boring, proven patterns over novel ones.
- Keep layers decoupled; do not leak infrastructure details into business logic.
- Define clear module boundaries and ownership.

## AI agent responsibilities
- Read `docs/ARCHITECTURE.md` before structural changes.
- Propose an ADR for any change that affects system structure, data flow, or dependencies.
- Never swap a framework, database, or major library without approval.
- Preserve existing interfaces unless explicitly authorized to change them.

## Review checklist for architectural changes
- [ ] ADR written
- [ ] Affected areas identified
- [ ] Migration path defined
- [ ] Rollback plan defined
- [ ] Performance impact considered
- [ ] Security impact considered
