"use client";

import { useEffect } from "react";
import { addHistory } from "@/lib/history";

/**
 * Invisible client component embedded in person/company detail pages.
 * Records the visit into local history on mount so it shows up in the
 * "Recently Viewed" panel on the Persons/Companies index pages.
 */
export default function TrackVisit({
  type,
  id,
  name,
  subtitle,
}: {
  type: "person" | "company";
  id: number;
  name: string;
  subtitle?: string | null;
}) {
  useEffect(() => {
    addHistory({ type, id, name, subtitle: subtitle ?? null });
    // Only re-run if the visited entity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  return null;
}
