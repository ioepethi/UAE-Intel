# 11 — SEO Standard (Web Projects)

## On-page
- **Page titles** — unique, descriptive, ≤ 60 chars where practical.
- **Meta descriptions** — unique, compelling, ≤ 160 chars.
- **Canonical URLs** — set on every indexable page.
- **Open Graph / Twitter cards** — for shareable pages.
- **Structured data** — JSON-LD for the page's entity type.
- **Semantic HTML** — one `<h1>`, logical heading hierarchy.
- **Internal linking** — descriptive anchor text; no orphan pages.
- **URL structure** — clean, readable, keyword-relevant, lowercase.

## Site-level
- **Sitemap** — `sitemap.xml` maintained and submitted.
- **Robots** — `robots.txt` with sensible allow/disallow.
- **Indexability** — server-render or SSR/SSG critical content; avoid client-only rendering for SEO-critical pages.
- **Performance** — Core Web Vitals are an SEO signal (see `.ai/10-performance.md`).

## AI agent responsibilities
- For new pages, include title, meta description, canonical, and OG tags.
- Preserve heading hierarchy; do not skip levels.
- Do not introduce client-only rendering for SEO-critical content without justification.
- Update `docs/SEO.md` when SEO strategy changes.
