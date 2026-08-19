// GET /api/companies — search companies.
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { findCompaniesByName } from "@uae-intel/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ companies: [] });
  const db = getDb();
  const companies = findCompaniesByName(db, name);
  return NextResponse.json({ companies });
}
