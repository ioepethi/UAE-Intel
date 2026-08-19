# 09 — Accessibility Standard

## Target
WCAG 2.2 AA where practical.

## Requirements
- **Semantic HTML** — use the right element for the job (`button`, `nav`, `main`, `section`, `article`).
- **Keyboard navigation** — every interactive element reachable and operable by keyboard.
- **Focus states** — visible, consistent, never removed without replacement.
- **Screen readers** — use ARIA only when semantics are insufficient; prefer native semantics.
- **Contrast** — text and interactive elements meet AA contrast ratios.
- **Form labels** — every input has an associated label; errors are announced.
- **Error messages** — programmatically associated with their field.
- **Alternative text** — meaningful images have alt text; decorative images use empty alt.
- **Touch targets** — minimum 24×24 CSS px (44×44 where practical).
- **Reduced motion** — respect `prefers-reduced-motion`.

## AI agent responsibilities
- For any UI change, verify keyboard operability and visible focus.
- Do not remove accessibility attributes unless replacing with equivalent semantics.
- Test with a screen reader when introducing complex widgets.
- Document accessibility considerations for new components.
