# 04 — Coding Standard

## Principle
> Prefer boring, understandable code over clever code.

## Naming
- Clear, intention-revealing names.
- Consistent casing per language convention.
- No abbreviations that hurt readability.
- Boolean names read as questions (`isValid`, `hasAccess`).

## File organization
- One primary export/concern per file where practical.
- Group by feature/domain, not by file type alone.
- Keep related code close.

## Type safety
- Use the project's type system strictly.
- Avoid `any` / untyped escape hatches unless justified in a comment.
- Prefer explicit types over inferred where inference is ambiguous.

## Error handling
- Handle errors at the right boundary.
- Do not swallow errors silently.
- Prefer typed errors over strings.
- No try/catch around every line — only where errors are expected and actionable.

## Logging
- Log meaningful events, not every step.
- Never log secrets, tokens, PII, or credentials.
- Use structured logging where supported.

## Comments
- Explain WHY, not WHAT.
- Do not restate code in prose.
- Keep comments next to the code they describe.
- Do not leave dead commented-out code.

## Dependency management
- Check the project already uses a library before adding it.
- Prefer dependencies published ≥ 7 days ago; avoid brand-new releases.
- Avoid floating ranges (`latest`, `*`, unbounded `>=`).
- Justify each new dependency.

## Configuration
- Use environment variables for environment-specific values.
- Never hardcode secrets, URLs, or credentials in source.
- Provide a `.env.example` with non-secret placeholders.

## Reusability / DRY / SOLID
- Extract duplication only when the abstraction is clearly justified.
- Apply SOLID where it improves clarity, not as dogma.
- Avoid premature abstraction.

## Maintainability
- Keep functions short and focused.
- Limit cyclomatic complexity.
- Prefer pure functions where practical.
- Make code testable.
