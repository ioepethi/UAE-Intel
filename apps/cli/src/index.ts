#!/usr/bin/env node
// UAE Intelligence CLI — §17 commands.
// Entry point. Wired with Commander.

import { Command } from "commander";
import { loadEnv } from "./lib.js";
import { findPerson } from "./commands/find-person.js";
import { findCeo } from "./commands/find-ceo.js";
import { findDirectors } from "./commands/find-directors.js";
import { findExecutives } from "./commands/find-executives.js";
import { deepResearch } from "./commands/deep-research.js";
import { researchLinkedIn } from "./commands/research-linkedin.js";
import { discover } from "./commands/discover.js";
import { search } from "./commands/search.js";

loadEnv();

const program = new Command();

program
  .name("uae-intel")
  .description("UAE Person/Company Intelligence & Business Contact Finder")
  .version("1.0.0");

// `find` parent command with subcommands (§17 "Find ..." commands).
const find = program.command("find").description("Find people or companies by criteria.");

find
  .command("person <name>")
  .description("Find a person by name (with optional company/title/location).")
  .option("--company <company>")
  .option("--title <title>")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--linkedin <url>")
  .option("--industry <industry>")
  .option("--depth <depth>", "QUICK | STANDARD | DEEP | DUE DILIGENCE", "STANDARD")
  .option("--out <file>", "Write report to file instead of stdout")
  .action(async (name: string, opts: Record<string, string>) => {
    await findPerson({ name, ...opts });
  });

find
  .command("ceo <company>")
  .description("Find the CEO of a company.")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--depth <depth>", "QUICK | STANDARD | DEEP | DUE DILIGENCE", "STANDARD")
  .option("--out <file>")
  .action(async (company: string, opts: Record<string, string>) => {
    await findCeo({ company, ...opts });
  });

find
  .command("directors <company>")
  .description("Find directors of a company.")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--depth <depth>", "QUICK | STANDARD | DEEP | DUE DILIGENCE", "STANDARD")
  .option("--out <file>")
  .action(async (company: string, opts: Record<string, string>) => {
    await findDirectors({ company, ...opts });
  });

find
  .command("executives <company>")
  .description("Find executives of a company.")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--depth <depth>", "QUICK | STANDARD | DEEP | DUE DILIGENCE", "STANDARD")
  .option("--out <file>")
  .action(async (company: string, opts: Record<string, string>) => {
    await findExecutives({ company, ...opts });
  });

program
  .command("deep-research <name>")
  .description("Deep research a person (DEEP depth).")
  .option("--company <company>")
  .option("--title <title>")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--linkedin <url>")
  .option("--industry <industry>")
  .option("--out <file>")
  .action(async (name: string, opts: Record<string, string>) => {
    await deepResearch({ name, ...opts });
  });

program
  .command("research <url>")
  .description("Research a public LinkedIn URL.")
  .option("--company <company>")
  .option("--location <location>", "Location", "Dubai, UAE")
  .option("--depth <depth>", "QUICK | STANDARD | DEEP | DUE DILIGENCE", "STANDARD")
  .option("--out <file>")
  .action(async (url: string, opts: Record<string, string>) => {
    await researchLinkedIn({ url, ...opts });
  });

program
  .command("discover <query>")
  .description("Bulk discovery: search for 100+ executives by criteria. e.g. 'CEOs of real estate companies in Dubai'")
  .option("--position <position>", "CEO | Founder | Director | Managing Director | Chairman | Owner | Partner | Investor | Executive")
  .option("--industry <industry>", "Real estate | Construction | Finance | Technology | Healthcare | Hospitality | Retail | Manufacturing | Logistics | Energy | Professional services")
  .option("--emirate <emirate>", "Dubai | Abu Dhabi | Sharjah | Ajman | Ras Al Khaimah | Fujairah | Umm Al Quwain")
  .option("--max-results <n>", "Maximum results (default 100)", "100")
  .option("--format <format>", "table | csv | json", "table")
  .option("--out <file>", "Write to file instead of stdout")
  .action(async (query: string, opts: Record<string, string>) => {
    await discover({ query, ...opts });
  });

program
  .command("search")
  .description("Search the local database of previously researched entities.")
  .option("--name <name>")
  .option("--title <title>")
  .option("--company <company>")
  .option("--emirate <emirate>")
  .option("--industry <industry>")
  .option("--min-confidence <n>")
  .action(async (opts: Record<string, string>) => {
    await search(opts);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
