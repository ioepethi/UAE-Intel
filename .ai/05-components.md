# 05 — Component Standard

## Principle
Search for an existing component before creating a new one. Composition over duplication.

## Every reusable component documents
- **Purpose** — what problem it solves
- **Usage** — when to use it (and when not to)
- **Variants** — supported variants
- **Props** — name, type, default, required, description
- **States** — loading, empty, error, success, disabled, focus
- **Responsive behavior** — per breakpoint
- **Accessibility** — semantics, keyboard, ARIA, focus
- **Examples** — minimal working examples

## Catalog
Maintain a component catalog in `docs/COMPONENTS.md` listing every reusable component with a link to its source and a one-line purpose.

## Rules
- Do not create a new component if an existing one can be composed or extended.
- Do not duplicate styling logic that already exists as a token or utility.
- Props must be typed.
- Side effects belong in hooks/services, not in presentational components.
- Components must be deterministic given the same props.

## AI agent responsibilities
- Before creating a component, grep/glob the codebase for candidates.
- If a candidate exists, extend it instead of forking.
- Update `docs/COMPONENTS.md` when adding or significantly changing a component.
