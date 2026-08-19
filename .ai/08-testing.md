# 08 — Testing Standard

## Principle
Choose the appropriate testing level based on risk. Not every change needs every test type, but every change needs the right tests.

## Test types
- **Unit tests** — pure functions, utilities, isolated logic.
- **Integration tests** — modules working together (e.g., service + repository).
- **API tests** — endpoints, contracts, status codes, payloads.
- **End-to-end tests** — critical user journeys through the real stack.
- **Regression tests** — a test for every fixed bug to prevent recurrence.
- **Visual QA** — for UI changes that affect layout/appearance.
- **Manual verification** — for flows not covered by automation.

## What must be tested
- Business logic and calculations
- Auth and authorization rules
- Edge cases and error paths
- Public API contracts
- Critical user journeys

## AI agent responsibilities
- Write a failing test first when fixing a bug (reproduce, then fix).
- Add or update tests for any behavior change.
- Do not delete tests to make a build pass; fix the cause.
- Run the test suite before declaring done.
- If no test infrastructure exists, ask before introducing one.

## Coverage
- Target meaningful coverage of critical paths, not arbitrary percentages.
- Prefer well-named tests over high coverage of trivial code.

## Test data
- Never use real PII or production data in tests.
- Use fixtures and factories.
- Reset state between tests where practical.
