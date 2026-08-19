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
      <div className="card">
        <h2>Discovery Search Engine</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
          Search for 100+ UAE executives by position, industry, and location. Returns public business contacts only.
        </p>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "CEOs of real estate companies in Dubai"'
            style={{ flex: 1 }}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        <div style={{ marginTop: 12, display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: "4px 10px" }}
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

      {loading && (
        <div className="card">
          <p style={{ color: "var(--text-muted)" }}>Running discovery searches across multiple sources…</p>
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Results: {result.total_found} people found</h2>
            <button className="btn btn-secondary" onClick={exportCSV} disabled={result.people.length === 0}>
              Export CSV
            </button>
          </div>

          {result.unknowns.length > 0 && (
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "var(--surface-2)", borderRadius: 6, fontSize: 13, color: "var(--text-muted)" }}>
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
