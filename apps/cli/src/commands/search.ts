// `search` — query the local DB (§12/§13).

import { getDb } from "../lib.js";
import { searchPersons, findCompaniesByName } from "@uae-intel/db";

export interface SearchArgs {
  name?: string;
  title?: string;
  company?: string;
  emirate?: string;
  industry?: string;
  minConfidence?: string;
}

export async function search(args: SearchArgs): Promise<void> {
  const db = getDb();
  const persons = searchPersons(db, {
    name: args.name,
    title: args.title,
    company: args.company,
    emirate: args.emirate as never,
    industry: args.industry as never,
    minConfidence: args.minConfidence ? Number(args.minConfidence) : undefined,
  });
  const companies = args.company ? findCompaniesByName(db, args.company) : [];
  db.close();

  if (persons.length === 0 && companies.length === 0) {
    console.log("No local records found. Run a research command first.");
    return;
  }
  if (persons.length) {
    console.log("Persons:");
    for (const p of persons) {
      console.log(`  [${p.confidence_score}%] ${p.full_name} — ${p.current_title ?? "?"} (${p.location ?? "?"})`);
    }
  }
  if (companies.length) {
    console.log("Companies:");
    for (const c of companies) {
      console.log(`  [${c.confidence_score}%] ${c.legal_name} — ${c.industry ?? "?"} (${c.emirate ?? "?"})`);
    }
  }
}
