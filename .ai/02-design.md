# 02 — Design Standard

## Principle
> Do not invent a new visual pattern when an existing approved component or pattern already exists.
> Design consistency is more important than adding visual effects.

## Design system (document in `docs/DESIGN.md`)
- Typography scale (families, sizes, weights, line-heights)
- Color tokens (brand, neutral, semantic: success/warning/error/info)
- Spacing scale (4px / 8px base)
- Grid and layout breakpoints
- Elevation/shadow tokens
- Radius tokens
- Motion tokens (duration, easing)

## Components
Each reusable component documents: purpose, usage, variants, props, states, responsive behavior, accessibility, examples. See `.ai/05-components.md`.

## States to design for every interactive surface
- Loading
- Empty
- Error
- Success
- Disabled
- Focus

## Avoid unless they serve a clear purpose
- Gradients
- Animations
- Glassmorphism
- Decorative shadows
- Purely aesthetic effects

## Responsive design
- Mobile-first.
- Define breakpoints and stick to them.
- Test at each breakpoint.

## DESIGN LOCK
Once a project's design is approved, AI agents must NOT independently redesign the visual identity. They may improve:
- accessibility
- responsiveness
- spacing
- usability
- performance
- content clarity

…but must preserve the approved design language unless explicitly instructed otherwise.

## Accessibility
Target WCAG 2.2 AA where practical. See `.ai/09-accessibility.md`.
