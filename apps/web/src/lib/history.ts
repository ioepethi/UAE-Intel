// Client-side visit history — tracks persons and companies the user has
// clicked into. No backend/auth exists yet, so this is stored in
// localStorage on the visitor's own browser (never sent to the server).

export interface HistoryEntry {
  type: "person" | "company";
  id: number;
  name: string;
  subtitle: string | null;
  visitedAt: string; // ISO timestamp
}

const STORAGE_KEY = "uae-intel-history";
const MAX_ENTRIES = 50;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "visitedAt">): void {
  if (!isBrowser()) return;
  try {
    const existing = getHistory().filter(
      (h) => !(h.type === entry.type && h.id === entry.id),
    );
    const updated: HistoryEntry[] = [
      { ...entry, visitedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("uae-intel-history-updated"));
  } catch {
    // Storage may be unavailable (private browsing, quota) — fail silently.
  }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("uae-intel-history-updated"));
  } catch {
    // Ignore.
  }
}
