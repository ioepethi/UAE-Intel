import { getDb } from "@/lib/server";
import { findCompaniesByName } from "@uae-intel/db";
import Link from "next/link";
import RecentHistory from "@/components/RecentHistory";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const sp = await searchParams;
  const db = await getDb();
  const companies = await findCompaniesByName(db, sp.name ?? "");

  return (
    <div>
      <div className="page-header">
        <h1>Companies</h1>
        <p>Companies saved from Discover and Deep Research runs.</p>
      </div>

      <div className="glass-card">
        <h2>Search</h2>
        <form method="get" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <div className="form-group" style={{ flex: "1 1 240px", margin: 0 }}>
            <label htmlFor="name">Company name</label>
            <input id="name" name="name" defaultValue={sp.name ?? ""} placeholder="e.g. Emaar Properties" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>{companies.length > 0 ? `${companies.length} companies` : "Search for a company"}</h2>
        {companies.length === 0 ? (
          <div className="empty">
            <h3>{sp.name ? "No matches" : "Nothing here yet"}</h3>
            <p>
              Run a <Link href="/discover">Discover</Link> search or{" "}
              <Link href="/research">Deep Research</Link> request to populate this list.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Emirate</th>
                <th>Website</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>
                    <Link href={`/companies/${c.id}`}>{c.legal_name}</Link>
                  </td>
                  <td>{c.industry ?? "—"}</td>
                  <td>{c.emirate ?? "—"}</td>
                  <td>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer">Visit</a>
                    ) : "—"}
                  </td>
                  <td>
                    <span className={`badge ${c.confidence_score >= 75 ? "badge-success" : c.confidence_score >= 50 ? "badge-warning" : "badge-error"}`}>
                      {c.confidence_score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RecentHistory filterType="company" />
    </div>
  );
}
