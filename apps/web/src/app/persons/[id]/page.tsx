import { getDb } from "@/lib/server";
import {
  getPerson,
  rolesForPerson,
  contactsForPerson,
  relationshipsForPerson,
} from "@uae-intel/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const db = await getDb();
  const id = Number(idStr);
  const person = await getPerson(db, id);
  if (!person) {
    notFound();
  }
  const roles = (await rolesForPerson(db, id)) as Array<{
    title: string;
    company_name: string;
    company_id: number;
    start_date: string | null;
    end_date: string | null;
    confidence: number;
  }>;
  const contacts = (await contactsForPerson(db, id)) as Array<{
    type: string;
    value: string;
    verification: string;
    confidence: number;
    source_id: number;
  }>;
  const rels = (await relationshipsForPerson(db, id)) as Array<{
    relationship_type: string;
    related_person_name: string | null;
    related_company_name: string | null;
    confidence: number;
  }>;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2>{person!.full_name}</h2>
            <p style={{ color: "var(--text-muted)" }}>
              {person!.current_title ?? "Title not verified"} · {person!.location ?? "Location not verified"}
            </p>
            {person!.linkedin_url && (
              <p>
                <a href={person!.linkedin_url}>LinkedIn profile</a>
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Identity confidence</div>
            <span className={`badge ${person!.confidence_score >= 75 ? "badge-success" : person!.confidence_score >= 50 ? "badge-warning" : "badge-error"}`}>
              {person!.confidence_score}%
            </span>
          </div>
        </div>
        {person!.name_variations.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
            Name variations: {person!.name_variations.join(", ")}
          </p>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Roles</h2>
          {roles.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No roles recorded.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <Link href={`/companies/${r.company_id}`}>{r.company_name}</Link>
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
          <h2>Business Contacts</h2>
          {contacts.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No public business contacts discovered.</p>
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
                      <span className={`badge ${c.verification === "VERIFIED" ? "badge-success" : c.verification === "HIGH" ? "badge-success" : c.verification === "MEDIUM" ? "badge-warning" : "badge-error"}`}>
                        {c.verification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {rels.length > 0 && (
        <div className="card">
          <h2>Business Network</h2>
          <table>
            <thead>
              <tr>
                <th>Related entity</th>
                <th>Relationship</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rels.map((r, i) => (
                <tr key={i}>
                  <td>{r.related_person_name ?? r.related_company_name ?? "—"}</td>
                  <td>{r.relationship_type}</td>
                  <td>{r.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <a href={`/api/export/person/${id}`} className="btn btn-secondary">Export as JSON</a>
      </div>
    </div>
  );
}
