// GET /api/companies/:id — full company profile.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { getCompany, rolesForCompany, contactsForCompany } from "@uae-intel/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const db = await getDb();
  const id = Number(idStr);
  const company = await getCompany(db, id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const roles = await rolesForCompany(db, id);
  const contacts = await contactsForCompany(db, id);
  return NextResponse.json({ company, roles, contacts });
}
