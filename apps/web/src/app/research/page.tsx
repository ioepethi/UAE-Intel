"use client";

import { useState } from "react";

interface ResearchResponse {
  report: string;
  identity_confidence: number;
  contacts_found: number;
  sources_count: number;
}

export default function ResearchPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [linkedin, setLinkedin] = useState("");
  const [depth, setDepth] = useState("STANDARD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, title, location, linkedinUrl: linkedin, depth }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as ResearchResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h2>New Research Request</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
          Public business data only. No auth bypass, no private LinkedIn, no fabricated contacts.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="name">Person name *</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Mohammed Al-Falasi" />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Emaar Properties" />
            </div>
            <div className="form-group">
              <label htmlFor="title">Title / Position</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CEO" />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn URL (optional)</label>
              <input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="form-group">
              <label htmlFor="depth">Research depth</label>
              <select id="depth" value={depth} onChange={(e) => setDepth(e.target.value)}>
                <option value="QUICK">Quick</option>
                <option value="STANDARD">Standard</option>
                <option value="DEEP">Deep</option>
                <option value="DUE DILIGENCE">Due Diligence</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading || !name}>
            {loading ? "Researching…" : "Run Research"}
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--error)" }}>
          <h2 style={{ color: "var(--error)" }}>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="card">
          <h2>Report</h2>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <span className="badge badge-success">Identity: {result.identity_confidence}%</span>
            <span className="badge badge-muted">{result.contacts_found} contacts</span>
            <span className="badge badge-muted">{result.sources_count} sources</span>
          </div>
          <div className="report">{result.report}</div>
        </div>
      )}
    </div>
  );
}
