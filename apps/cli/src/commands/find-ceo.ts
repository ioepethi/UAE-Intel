// `find ceo of <company>` — §17 command.

import { runResearchAndPrint } from "./shared.js";

export interface FindCeoArgs {
  company: string;
  location?: string;
  depth?: string;
  out?: string;
}

export async function findCeo(args: FindCeoArgs): Promise<void> {
  await runResearchAndPrint({
    company: args.company,
    title: "CEO",
    location: args.location ?? "Dubai, UAE",
    depth: args.depth,
    out: args.out,
  });
}
