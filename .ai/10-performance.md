# 10 — Performance Standard

## Principle
Avoid unnecessary libraries and unnecessary network requests. Measure before optimizing.

## Targets (web)
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- JavaScript bundle: keep baseline small; code-split routes and heavy features.
- API latency: p95 targets defined per endpoint in `docs/ARCHITECTURE.md`.

## Areas to manage
- **Page loading** — critical path, render-blocking resources.
- **Images** — correct format, sizing, lazy loading, `width`/`height` to prevent CLS.
- **Fonts** — subset, preload critical fonts, use `font-display: swap`.
- **JavaScript** — avoid unused code, prefer modern bundling, code-split.
- **API latency** — avoid N+1 queries, paginate, cache where valid.
- **Database queries** — index hot paths, avoid fetching unnecessary columns.
- **Caching** — HTTP caching, app-level caching, invalidation strategy.
- **Lazy loading** — defer non-critical modules and assets.
- **Server response** — keep server processing lean.
- **Network usage** — compress responses, minimize payloads.

## AI agent responsibilities
- Do not add a dependency that bloats the bundle without justification.
- Prefer built-in browser/platform features over libraries where equivalent.
- Avoid waterfalls in data fetching; parallelize independent requests.
- Flag performance regressions introduced by a change.
