import { getDb } from "@/lib/server";
import { searchPersons, findCompaniesByName } from "@uae-intel/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { name?: string; company?: string; emirate?: string; industry?: string };
}) {
  const db = getDb();
  const persons = searchParams.name
    ? searchPersons(db, {
        name: searchParams.name,
        emirate: searchParams.emirate as never,
        industry: searchParams.industry as never,
      })
    : [];
  const companies = searchParams.company
    ? findCompaniesByName(db, searchParams.company)
    : [];
  db.close();

  return (
    <div>
      <div className="card">
        <h2>Search the local intelligence database</h2>
        <form method="get" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label htmlFor="name">Person name</label>
            <input id="name" name="name" defaultValue={searchParams.name ?? ""} placeholder="e.g. Mohammed Al-Falasi" />
          </div>
          <div className="form-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label htmlFor="company">Company</label>
            <input id="company" name="company" defaultValue={searchParams.company ?? ""} placeholder="e.g. Emaar Properties" />
          </div>
          <div className="form-group" style={{ flex: "1 1 120px", margin: 0 }}>
            <label htmlFor="emirate">Emirate</label>
            <select id="emirate" name="emirate" defaultValue={searchParams.emirate ?? ""}>
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

      {persons.length > 0 && (
        <div className="card">
          <h2>Persons ({persons.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Location</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/persons/${p.id}`}>{p.full_name}</Link>
                  </td>
                  <td>{p.current_title ?? "—"}</td>
                  <td>{p.location ?? "—"}</td>
                  <td>
                    <ConfidenceBadge score={p.confidence_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {companies.length > 0 && (
        <div className="card">
          <h2>Companies ({companies.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Emirate</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/companies/${c.id}`}>{c.legal_name}</Link>
                  </td>
                  <td>{c.industry ?? "—"}</td>
                  <td>{c.emirate ?? "—"}</td>
                  <td>
                    <ConfidenceBadge score={c.confidence_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searchParams.name && !searchParams.company && (
        <div className="empty">
          <h3>No search yet</h3>
          <p>
            Search for a person or company above, or{" "}
            <Link href="/research">start a new research request</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const cls = score >= 75 ? "badge-success" : score >= 50 ? "badge-warning" : "badge-error";
  return <span className={`badge ${cls}`}>{score}%</span>;
}
