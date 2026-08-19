"use client";

import { useState } from "react";

interface DiscoveredPerson {
  name: string;
  title: string | null;
  company: string | null;
  industry: string | null;
  emirate: string | null;
  location: string | null;
  linkedin_url: string | null;
  company_website: string | null;
  business_phone: string | null;
  company_email: string | null;
  confidence: number;
}

interface DiscoveryResult {
  people: DiscoveredPerson[];
  total_found: number;
  unknowns: string[];
}

const EXAMPLE_QUERIES = [
  "CEOs of real estate companies in Dubai",
  "Directors of construction companies in Abu Dhabi",
  "Founders of technology companies in UAE",
  "Managing Directors of finance companies in Dubai",
  "Chairmen of hospitality companies in UAE",
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as DiscoveryResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!result) return;
    const headers = ["Name", "Title", "Company", "Industry", "Emirate", "Business Phone", "Company Email", "LinkedIn", "Confidence"];
    const rows = result.people.map((p) => [p.name, p.title ?? "", p.company ?? "", p.industry ?? "", p.emirate ?? "", p.business_phone ?? "", p.company_email ?? "", p.linkedin_url ?? "", String(p.confidence)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uae-discovery-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Discover</h1>
        <p>Bulk search engine for UAE executives with public business contacts.</p>
      </div>

      {/* Glassmorphism search area */}
      <div className="search-glass">
        <h2>Discovery Search Engine</h2>
        <p className="subtitle">
          Search for 100+ UAE executives by position, industry, and location. Returns public business contacts only.
        </p>
        <form onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "CEOs of real estate companies in Dubai"'
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-dots">
                    <span /> <span /> <span />
                  </span>
                  Searching
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
        <div className="chip-row">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              className="chip"
              onClick={() => setQuery(q)}
              type="button"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--error)" }}>
          <p style={{ color: "var(--error)" }}>{error}</p>
        </div>
      )}

      {loading && !result && (
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>
            <span className="loading-dots" style={{ marginRight: 8 }}>
              <span /> <span /> <span />
            </span>
            Running discovery searches across multiple sources…
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Results: {result.total_found} people found</h2>
            <button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={result.people.length === 0}>
              Export CSV
            </button>
          </div>

          {result.unknowns.length > 0 && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-muted)" }}>
              {result.unknowns.map((u, i) => (
                <div key={i}>⚠ {u}</div>
              ))}
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Emirate</th>
                  <th>Business Phone</th>
                  <th>Company Email</th>
                  <th>LinkedIn</th>
                  <th>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {result.people.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.title ?? "—"}</td>
                    <td>
                      {p.company_website ? (
                        <a href={p.company_website} target="_blank" rel="noopener noreferrer">{p.company ?? "—"}</a>
                      ) : (
                        p.company ?? "—"
                      )}
                    </td>
                    <td>{p.emirate ?? "UAE"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{p.business_phone ?? "—"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{p.company_email ?? "—"}</td>
                    <td>
                      {p.linkedin_url ? (
                        <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer">Profile</a>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`badge ${p.confidence >= 60 ? "badge-success" : p.confidence >= 40 ? "badge-warning" : "badge-error"}`}>
                        {p.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
