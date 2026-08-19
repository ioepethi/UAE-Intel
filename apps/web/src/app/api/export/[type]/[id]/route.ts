// GET /api/export/:type/:id — export an entity as JSON (downloadable).
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import {
  getPerson,
  getCompany,
  rolesForPerson,
  contactsForPerson,
  relationshipsForPerson,
  rolesForCompany,
  contactsForCompany,
} from "@uae-intel/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { type: string; id: string } }) {
  const db = getDb();
  const id = Number(params.id);
  const type = params.type;

  if (type === "person") {
    const person = getPerson(db, id);
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const roles = rolesForPerson(db, id);
    const contacts = contactsForPerson(db, id);
    const relationships = relationshipsForPerson(db, id);
    const data = { person, roles, contacts, relationships, exported_at: new Date().toISOString() };
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="person-${id}.json"`,
      },
    });
  }

  if (type === "company") {
    const company = getCompany(db, id);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const roles = rolesForCompany(db, id);
    const contacts = contactsForCompany(db, id);
    const data = { company, roles, contacts, exported_at: new Date().toISOString() };
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="company-${id}.json"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid export type. Use 'person' or 'company'." }, { status: 400 });
}
