// `research <linkedin-url>` — §17 command.

import { runResearchAndPrint } from "./shared.js";

export interface ResearchLinkedInArgs {
  url: string;
  company?: string;
  location?: string;
  depth?: string;
  out?: string;
}

export async function researchLinkedIn(args: ResearchLinkedInArgs): Promise<void> {
  await runResearchAndPrint({
    linkedinUrl: args.url,
    company: args.company,
    location: args.location ?? "Dubai, UAE",
    depth: args.depth,
    out: args.out,
  });
}
