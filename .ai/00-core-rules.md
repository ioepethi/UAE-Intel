# 00 — Core Rules (Non-Negotiable)

> These rules override everything else. Violating any of them is a defect.

## R1. Read before write
Never edit a file you have not read in the current session. Understand surrounding code, imports, and conventions first.

## R2. Do not guess
Missing requirements, data, credentials, or design intent → ask or label `NOT VERIFIED`. Never fabricate.

## R3. Scope discipline
Touch only what the task requires. Unrelated refactors, framework swaps, or deletions require explicit approval.

## R4. Reuse before create
Search the codebase for an existing component, utility, hook, service, or pattern before introducing a new one.

## R5. No secrets in source
Secrets, API keys, tokens, and credentials never go in source code, commits, logs, or screenshots. Use environment variables and secret managers.

## R6. Preserve working functionality
Existing working behavior stays intact unless the task explicitly requires changing it. Regressions are defects.

## R7. Explain architectural changes
Any significant architectural change requires a plan, approval, and an ADR entry in `docs/DECISIONS.md`.

## R8. Verify before declaring done
Run the applicable checks (lint, typecheck, build, tests). A task is not done until verification passes.

## R9. Document meaningful changes
Update WHY / WHAT / HOW docs for any meaningful change (see `.ai/06-documentation.md`).

## R10. Report honestly
Report what changed, what is uncertain, what failed, and what remains open. Do not hide errors or unknowns.
