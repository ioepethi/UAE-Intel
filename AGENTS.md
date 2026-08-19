# AGENTS.md — AI Development Constitution

> **Master governance file for AI coding agents (Cursor, Devin, Claude Code, and future agents).**
> Version: 1.0.0
> Last updated: 2026-08-19

This file is the single source of truth for how AI agents must behave in this repository.
All agents MUST read this file before modifying any code, configuration, or documentation.

Detailed standards live in `.ai/` and are referenced from here. Do not duplicate rules.

---

## 0. How to use this file

1. Read `AGENTS.md` (this file) on every session.
2. Read `.ai/00-core-rules.md` for non-negotiable operating rules.
3. Read the relevant `.ai/*.md` standard for the task at hand (design, coding, security, testing, etc.).
4. Read relevant `docs/*.md` for project-specific context.
5. Follow the workflow defined in §4.
6. Respect scope. Ask when uncertain. Never guess.

---

## 1. AI Principles

### Understand before modifying
Inspect the existing project, conventions, dependencies, and surrounding code before changing anything. Read before write.

### Do not guess
When requirements, architecture, APIs, business rules, data structures, credentials, or design intent are unclear, the AI must identify the uncertainty and ask — instead of inventing requirements. Missing information is labeled `NOT VERIFIED`, never fabricated.

### Scope control
Modify only what is necessary to accomplish the requested task. Do not:
- redesign unrelated pages
- rewrite unrelated code
- replace frameworks without approval
- modify unrelated APIs
- modify authentication unnecessarily
- introduce unnecessary dependencies
- change infrastructure without justification
- delete functionality to simplify implementation

### Reuse before creating
Before creating a new component, utility, hook, service, API, style, or database structure, search for an existing implementation that can be reused or extended.

### Simple over clever
Prefer readable code, maintainable architecture, predictable behavior, simple solutions, and explicit logic. Avoid unnecessary abstraction and complexity.

### Preserve existing functionality
Existing working functionality must remain intact unless the request explicitly requires changing it. Regression is a defect.

### No silent architectural changes
Any significant architectural change must be explained in a plan and recorded in `docs/DECISIONS.md` as an Architecture Decision Record (ADR).

### Document like an enterprise team
Every meaningful change updates the relevant documentation (see `.ai/06-documentation.md`).

---

## 2. Workflow

### Mandatory workflow (major tasks)
```text
REQUEST → ANALYZE → PLAN → APPROVAL IF REQUIRED → IMPLEMENT → TEST → REVIEW → DOCUMENT → COMMIT
```

### Simple task (small, low-risk changes)
```text
ANALYZE → IMPLEMENT → VERIFY
```

### Major task (architecture, database, auth, infra, high-risk)
```text
ANALYZE → PLAN → REQUEST APPROVAL → IMPLEMENT → TEST → REVIEW → DOCUMENT
```

The AI determines which level applies based on risk. When in doubt, treat as major.

---

## 3. AI operating modes

| Mode      | Action                                                          |
|-----------|-----------------------------------------------------------------|
| ANALYZE   | Inspect, do not modify files.                                   |
| PLAN      | Produce an implementation plan; do not modify code.             |
| IMPLEMENT | Make the approved change only.                                  |
| VERIFY    | Run tests, lint, typecheck, build.                              |
| REVIEW    | Self-review the work like a senior engineer.                    |
| DOCUMENT  | Update relevant docs (WHY / WHAT / HOW).                        |
| REPORT    | Explain what changed, why, files affected, tests, risks, open issues. |

See `.ai/15-ai-behavior.md` for full definitions.

---

## 4. Definition of Done

A task is not complete until the applicable checks pass. The AI selects which checks apply based on the change.

- [ ] Requirement satisfied
- [ ] Scope respected (no unrelated changes)
- [ ] Existing functionality preserved
- [ ] Design system followed (`.ai/02-design.md`)
- [ ] Responsive behavior verified (where UI is touched)
- [ ] Accessibility considered (`.ai/09-accessibility.md`)
- [ ] Errors handled
- [ ] Tests completed (`.ai/08-testing.md`)
- [ ] Security considered (`.ai/07-security.md`)
- [ ] Performance considered (`.ai/10-performance.md`)
- [ ] Documentation updated (`.ai/06-documentation.md`)
- [ ] Changes self-reviewed

Trivial tasks do not require every check, but the AI must justify omissions.

---

## 5. Scope and approval gates

Approval is required before implementation for:
- Architectural changes
- Database schema changes
- Authentication / authorization changes
- Infrastructure or deployment changes
- Adding or replacing dependencies
- Deleting functionality
- Anything touching secrets, PII, or production data

For simple, in-scope changes, proceed and report.

---

## 6. Standards index

| Standard                  | File                          |
|---------------------------|-------------------------------|
| Core rules                | `.ai/00-core-rules.md`        |
| Product                   | `.ai/01-product.md`           |
| Design                    | `.ai/02-design.md`            |
| Architecture              | `.ai/03-architecture.md`      |
| Coding                    | `.ai/04-coding.md`            |
| Components                | `.ai/05-components.md`        |
| Documentation             | `.ai/06-documentation.md`     |
| Security                  | `.ai/07-security.md`          |
| Testing                   | `.ai/08-testing.md`           |
| Accessibility             | `.ai/09-accessibility.md`     |
| Performance               | `.ai/10-performance.md`       |
| SEO                       | `.ai/11-seo.md`               |
| Analytics                 | `.ai/12-analytics.md`         |
| Deployment                | `.ai/13-deployment.md`        |
| Change management         | `.ai/14-change-management.md` |
| AI behavior               | `.ai/15-ai-behavior.md`       |

---

## 7. Operating philosophy

> THINK LIKE A PRODUCT DESIGNER.
> ARCHITECT LIKE A SENIOR ENGINEER.
> CODE LIKE A DISCIPLINED DEVELOPER.
> TEST LIKE QA.
> SECURE LIKE A SECURITY ENGINEER.
> DOCUMENT LIKE AN ENTERPRISE TEAM.
> MOVE LIKE A STARTUP.
> NEVER GUESS WHEN YOU CAN ASK.
