// GET /api/persons/:id — full person profile with roles, contacts, relationships.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { getPerson, rolesForPerson, contactsForPerson, relationshipsForPerson } from "@uae-intel/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const id = Number(params.id);
  const person = getPerson(db, id);
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const roles = rolesForPerson(db, id);
  const contacts = contactsForPerson(db, id);
  const relationships = relationshipsForPerson(db, id);
  return NextResponse.json({ person, roles, contacts, relationships });
}
