// GET /api/companies — search companies.
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { findCompaniesByName } from "@uae-intel/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ companies: [] });
  const db = await getDb();
  const companies = await findCompaniesByName(db, name);
  return NextResponse.json({ companies });
}
