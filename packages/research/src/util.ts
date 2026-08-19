// Small concurrency utilities — avoids pulling in a dependency like p-limit.

/**
 * Run `fn` over `items` with at most `concurrency` in flight at once.
 * Failures are swallowed per-item (returns undefined for that slot) so one
 * slow/broken host never aborts the whole batch — callers should treat
 * `undefined` results as "skip".
 */
export async function mapLimit<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<(R | undefined)[]> {
  const results: (R | undefined)[] = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await fn(items[i], i);
      } catch {
        results[i] = undefined;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
