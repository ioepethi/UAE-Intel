// GET /api/persons/:id — full person profile with roles, contacts, relationships.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { getPerson, rolesForPerson, contactsForPerson, relationshipsForPerson } from "@uae-intel/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const db = await getDb();
  const id = Number(idStr);
  const person = await getPerson(db, id);
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const roles = await rolesForPerson(db, id);
  const contacts = await contactsForPerson(db, id);
  const relationships = await relationshipsForPerson(db, id);
  return NextResponse.json({ person, roles, contacts, relationships });
}
