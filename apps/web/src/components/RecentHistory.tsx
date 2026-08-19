"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/history";

export default function RecentHistory({ filterType }: { filterType?: "person" | "company" }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => setEntries(getHistory());
    load();
    window.addEventListener("uae-intel-history-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("uae-intel-history-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (!mounted) return null;

  const filtered = filterType ? entries.filter((e) => e.type === filterType) : entries;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2>Recently Viewed</h2>
        {filtered.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => clearHistory()}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Persons and companies you open will show up here for quick access.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((entry) => (
            <Link
              key={`${entry.type}-${entry.id}`}
              href={entry.type === "person" ? `/persons/${entry.id}` : `/companies/${entry.id}`}
              className="sidebar-link"
              style={{ padding: "10px 12px", justifyContent: "space-between" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`badge ${entry.type === "person" ? "badge-accent" : "badge-muted"}`}>
                  {entry.type === "person" ? "Person" : "Company"}
                </span>
                <span style={{ color: "var(--text)" }}>{entry.name}</span>
                {entry.subtitle && (
                  <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{entry.subtitle}</span>
                )}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: 12 }}>
                {new Date(entry.visitedAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
