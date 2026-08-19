// `find executives of <company>` — §17 command.

import { runResearchAndPrint } from "./shared.js";

export interface FindExecutivesArgs {
  company: string;
  location?: string;
  depth?: string;
  out?: string;
}

export async function findExecutives(args: FindExecutivesArgs): Promise<void> {
  await runResearchAndPrint({
    company: args.company,
    title: "Executive",
    location: args.location ?? "Dubai, UAE",
    depth: args.depth,
    out: args.out,
  });
}
