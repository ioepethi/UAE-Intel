// `find person <name>` — §17 command.

import { runResearchAndPrint } from "./shared.js";
// (lib helpers are accessed via shared.ts)

export interface FindPersonArgs {
  name: string;
  company?: string;
  title?: string;
  location?: string;
  linkedin?: string;
  industry?: string;
  depth?: string;
  out?: string;
}

export async function findPerson(args: FindPersonArgs): Promise<void> {
  await runResearchAndPrint({
    name: args.name,
    company: args.company,
    title: args.title,
    location: args.location ?? "Dubai, UAE",
    linkedinUrl: args.linkedin,
    industry: args.industry,
    depth: args.depth,
    out: args.out,
  });
}
