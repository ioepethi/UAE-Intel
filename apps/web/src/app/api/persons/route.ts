// GET /api/persons — search persons (§12/§13).
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/server";
import { searchPersons } from "@uae-intel/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const db = await getDb();
  const persons = await searchPersons(db, {
    name: sp.get("name") ?? undefined,
    title: sp.get("title") ?? undefined,
    company: sp.get("company") ?? undefined,
    emirate: (sp.get("emirate") ?? undefined) as never,
    industry: (sp.get("industry") ?? undefined) as never,
    minConfidence: sp.get("minConfidence") ? Number(sp.get("minConfidence")) : undefined,
  });
  return NextResponse.json({ persons });
}
