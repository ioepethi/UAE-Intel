import { getDb } from "@/lib/server";
import { getCompany, rolesForCompany, contactsForCompany } from "@uae-intel/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CompanyPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const id = Number(params.id);
  const company = getCompany(db, id);
  if (!company) {
    db.close();
    notFound();
  }
  const roles = rolesForCompany(db, id) as Array<{
    title: string;
    person_name: string;
    person_id: number;
    start_date: string | null;
    end_date: string | null;
  }>;
  const contacts = contactsForCompany(db, id) as Array<{
    type: string;
    value: string;
    verification: string;
  }>;
  db.close();

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>{company!.legal_name}</h2>
            <p style={{ color: "var(--text-muted)" }}>
              {company!.industry ?? "Industry not verified"} · {company!.emirate ?? "Emirate not verified"}
            </p>
            {company!.website && (
              <p>
                <a href={company!.website}>{company!.website}</a>
              </p>
            )}
            {company!.trading_name && company!.trading_name !== company!.legal_name && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Trading as: {company!.trading_name}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Confidence</div>
            <span className={`badge ${company!.confidence_score >= 75 ? "badge-success" : company!.confidence_score >= 50 ? "badge-warning" : "badge-error"}`}>
              {company!.confidence_score}%
            </span>
          </div>
        </div>
      </div>

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
                    <td>
                      {r.start_date ?? "?"} — {r.end_date ?? "present"}
                    </td>
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

      <div style={{ marginTop: 16 }}>
        <a href={`/api/export/company/${id}`} className="btn btn-secondary">Export as JSON</a>
      </div>
    </div>
  );
}
