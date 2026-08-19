# 14 — Change Management Standard

## Principle
Prevent AI scope creep. Every significant change is scoped, documented, and reviewable.

## Change definition
For every significant change, define:

```text
Objective
Scope
Out of Scope
Constraints
Affected Areas
Risks
Implementation
Testing
Documentation
Rollback
```

## Process
1. Author a change request using `templates/change-request.md` (or feature request for new capabilities).
2. Get approval for major changes (see `AGENTS.md` §5).
3. Implement within scope only.
4. Test, review, document.
5. Record the change in `docs/CHANGELOG.md`.
6. Record architectural decisions in `docs/DECISIONS.md`.

## AI agent responsibilities
- Stay within the approved scope.
- If the task reveals a needed out-of-scope change, flag it — do not silently expand scope.
- Update `docs/CHANGELOG.md` for every released change.
