import { getDb } from "@/lib/server";
import { getCompany, rolesForCompany, contactsForCompany } from "@uae-intel/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const db = await getDb();
  const id = Number(idStr);
  const company = await getCompany(db, id);
  if (!company) {
    notFound();
  }
  const roles = (await rolesForCompany(db, id)) as Array<{
    title: string;
    person_name: string;
    person_id: number;
    start_date: string | null;
    end_date: string | null;
  }>;
  const contacts = (await contactsForCompany(db, id)) as Array<{
    type: string;
    value: string;
    verification: string;
  }>;

  return (
    <div>
      <div className="page-header">
        <h1>{company!.legal_name}</h1>
        <p>{company!.industry ?? "Industry not verified"} · {company!.emirate ?? "Emirate not verified"}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{company!.confidence_score}%</div>
          <div className="stat-label">Confidence</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{roles.length}</div>
          <div className="stat-label">People</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{contacts.length}</div>
          <div className="stat-label">Contacts</div>
        </div>
      </div>

      {company!.website && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <a href={company!.website} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
            {company!.website} →
          </a>
          {company!.trading_name && company!.trading_name !== company!.legal_name && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              Trading as: {company!.trading_name}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h2>People</h2>
          {roles.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No people recorded.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <Link href={`/persons/${r.person_id}`}>{r.person_name}</Link>
                    </td>
                    <td>{r.title}</td>
                    <td>{r.start_date ?? "?"} — {r.end_date ?? "present"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Company Contacts</h2>
          {contacts.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No public contacts discovered.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i}>
                    <td>{c.type.replace(/_/g, " ")}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{c.value}</td>
                    <td>
                      <span className="badge badge-muted">{c.verification}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href={`/api/export/company/${id}`} className="btn btn-secondary btn-sm">Export as JSON</a>
      </div>
    </div>
  );
}
