// GET /api/companies/:id — full company profile.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { getCompany, rolesForCompany, contactsForCompany } from "@uae-intel/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const id = Number(params.id);
  const company = getCompany(db, id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const roles = rolesForCompany(db, id);
  const contacts = contactsForCompany(db, id);
  return NextResponse.json({ company, roles, contacts });
}
