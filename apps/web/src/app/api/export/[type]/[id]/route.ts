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

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id: idStr } = await params;
  const db = await getDb();
  const id = Number(idStr);

  if (type === "person") {
    const person = await getPerson(db, id);
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const roles = await rolesForPerson(db, id);
    const contacts = await contactsForPerson(db, id);
    const relationships = await relationshipsForPerson(db, id);
    const data = { person, roles, contacts, relationships, exported_at: new Date().toISOString() };
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="person-${id}.json"`,
      },
    });
  }

  if (type === "company") {
    const company = await getCompany(db, id);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const roles = await rolesForCompany(db, id);
    const contacts = await contactsForCompany(db, id);
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
