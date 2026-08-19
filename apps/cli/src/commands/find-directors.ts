// `find directors of <company>` — §17 command.

import { runResearchAndPrint } from "./shared.js";

export interface FindDirectorsArgs {
  company: string;
  location?: string;
  depth?: string;
  out?: string;
}

export async function findDirectors(args: FindDirectorsArgs): Promise<void> {
  await runResearchAndPrint({
    company: args.company,
    title: "Director",
    location: args.location ?? "Dubai, UAE",
    depth: args.depth,
    out: args.out,
  });
}
