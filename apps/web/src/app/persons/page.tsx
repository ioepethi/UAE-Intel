import { getDb } from "@/lib/server";
import { searchPersons } from "@uae-intel/db";
import Link from "next/link";
import RecentHistory from "@/components/RecentHistory";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PersonsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; emirate?: string; industry?: string }>;
}) {
  const sp = await searchParams;
  const db = await getDb();
  const persons = await searchPersons(db, {
    name: sp.name,
    emirate: sp.emirate as never,
    industry: sp.industry as never,
  });

  return (
    <div>
      <div className="page-header">
        <h1>Persons</h1>
        <p>Everyone discovered so far, saved from Discover and Deep Research runs.</p>
      </div>

      <div className="glass-card">
        <h2>Search</h2>
        <form method="get" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <div className="form-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={sp.name ?? ""} placeholder="e.g. Mohammed Al-Falasi" />
          </div>
          <div className="form-group" style={{ flex: "1 1 160px", margin: 0 }}>
            <label htmlFor="emirate">Emirate</label>
            <select id="emirate" name="emirate" defaultValue={sp.emirate ?? ""}>
              <option value="">Any</option>
              <option>Dubai</option>
              <option>Abu Dhabi</option>
              <option>Sharjah</option>
              <option>Ajman</option>
              <option>Ras Al Khaimah</option>
              <option>Fujairah</option>
              <option>Umm Al Quwain</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>{persons.length > 0 ? `${persons.length} persons` : "All persons"}</h2>
        {persons.length === 0 ? (
          <div className="empty">
            <h3>Nothing here yet</h3>
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
                <th>Title</th>
                <th>Location</th>
                <th>LinkedIn</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>
                    <Link href={`/persons/${p.id}`}>{p.full_name}</Link>
                  </td>
                  <td>{p.current_title ?? "—"}</td>
                  <td>{p.location ?? "—"}</td>
                  <td>
                    {p.linkedin_url ? (
                      <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer">Profile</a>
                    ) : "—"}
                  </td>
                  <td>
                    <span className={`badge ${p.confidence_score >= 75 ? "badge-success" : p.confidence_score >= 50 ? "badge-warning" : "badge-error"}`}>
                      {p.confidence_score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RecentHistory />
    </div>
  );
}
