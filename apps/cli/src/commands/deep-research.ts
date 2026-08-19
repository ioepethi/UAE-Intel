// `deep research <name>` — §17 command.

import { runResearchAndPrint } from "./shared.js";

export interface DeepResearchArgs {
  name: string;
  company?: string;
  title?: string;
  location?: string;
  linkedin?: string;
  industry?: string;
  out?: string;
}

export async function deepResearch(args: DeepResearchArgs): Promise<void> {
  await runResearchAndPrint({
    name: args.name,
    company: args.company,
    title: args.title,
    location: args.location ?? "Dubai, UAE",
    linkedinUrl: args.linkedin,
    industry: args.industry,
    depth: "DEEP",
    out: args.out,
  });
}
