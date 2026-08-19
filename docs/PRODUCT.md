# PRODUCT

> Product definition for the UAE Intelligence system.

## Summary
A business intelligence research system that identifies UAE companies, executives, founders, directors, and other decision-makers; maps their business relationships; finds legitimate public business contacts; and produces fully-sourced intelligence reports with confidence scoring.

## Target users / personas
- **Business development professionals** — need to identify and contact UAE decision-makers.
- **Investment researchers** — need to map company ownership, directorships, and relationships.
- **Sales teams** — need verified professional contact routes for UAE executives.
- **Due diligence analysts** — need sourced, cross-checked business intelligence with confidence scores.

## Core problems solved
- Finding the *correct* person among many with similar names (identity resolution).
- Connecting people to companies, boards, and related entities.
- Finding legitimate public business contact channels without privacy violations.
- Cross-checking information across independent sources with transparent confidence scoring.
- Producing structured, sourced reports instead of raw search results.

## Key user journeys
1. **Find a person:** `find person "Mohammed Al-Falasi" --company "Emaar"` → identity-resolved report with contacts.
2. **Find a CEO:** `find ceo "Dubai Holdings"` → report identifying the current CEO.
3. **Deep research:** `deep-research "Ahmed bin Saeed"` → extensive multi-source report.
4. **Browse the graph:** Open web dashboard → search → view entity profile → explore relationships.
5. **Export:** Save report as Markdown file or export from web as CSV/JSON.

## Success metrics (KPIs)
- Identity confidence ≥ 75% for well-known executives.
- Contact discovery rate: ≥ 1 public business contact for 60% of researched executives.
- Source coverage: ≥ 3 independent sources per DEEP report.
- Zero fabricated contacts (every contact has a recorded source).

## Non-goals
- Private surveillance or obtaining non-public personal information.
- Bypassing LinkedIn authentication or scraping private profiles.
- Accessing leaked, stolen, or hacked datasets.
- Estimating private net worth as a factual claim.
- Real-time monitoring of individuals.

## Constraints
- Public data only (legal and ethical compliance).
- UAE-focused (Dubai, Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, UAQ).
- Requires a Tavily API key for live web research.
- Single-user/local deployment (SQLite).
