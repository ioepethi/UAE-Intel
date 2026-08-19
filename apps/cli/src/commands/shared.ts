// Shared runner used by all research commands: run engine → render report → print/save.

import { generateReport } from "@uae-intel/report";
import { getEngine, parseDepth, writeFile } from "../lib.js";

export interface RunArgs {
  name?: string;
  company?: string;
  title?: string;
  location?: string;
  linkedinUrl?: string;
  industry?: string;
  depth?: string;
  out?: string;
}

export async function runResearchAndPrint(args: RunArgs): Promise<void> {
  const engine = getEngine();
  console.log("Researching… (this may take a moment)\n");
  const result = await engine.run({
    name: args.name,
    company: args.company,
    title: args.title,
    location: args.location,
    linkedinUrl: args.linkedinUrl,
    industry: args.industry,
    depth: parseDepth(args.depth),
  });
  const markdown = generateReport(result);
  if (args.out) {
    writeFile(args.out, markdown);
  } else {
    console.log(markdown);
  }
}
