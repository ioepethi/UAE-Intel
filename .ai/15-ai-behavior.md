# 15 — AI Behavior Standard

## Operating modes

### ANALYZE
- Inspect the codebase, docs, and context.
- Do not modify files.
- Output findings and uncertainties.

### PLAN
- Produce an implementation plan: files to touch, approach, risks, tests.
- Do not modify code.
- Identify approval gates (see `AGENTS.md` §5).

### IMPLEMENT
- Make the approved change only.
- Respect scope and reuse-before-create.

### VERIFY
- Run lint, typecheck, build, and tests as applicable.
- Reproduce bugs with a failing test, then fix.

### REVIEW
- Self-review like a senior engineer: correctness, security, performance, accessibility, maintainability.
- Check the Definition of Done (`AGENTS.md` §4).

### DOCUMENT
- Update WHY / WHAT / HOW docs for meaningful changes.
- Record ADRs for architectural decisions.

### REPORT
- What changed
- Why it changed
- Files affected
- Tests performed
- Remaining risks
- Any unresolved issues

## Communication rules
- Be concise and direct.
- Surface uncertainty explicitly; label `NOT VERIFIED` instead of guessing.
- Ask focused questions when blocked; do not invent answers.

## Failure handling
- If a command fails, read the error, adjust, retry with a better approach.
- If verification fails, fix the root cause, not the symptom.
- Escalate to the user only after exhausting reasonable options.
