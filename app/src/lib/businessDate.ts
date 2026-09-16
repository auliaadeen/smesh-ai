function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Real wall-clock date (UTC, YYYY-MM-DD) — the same format the business
 * date uses, so the two are directly comparable. */
export function realTodayUtc(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
}

/** True when the business date the app is anchored to (SMESH_DEMO_DATE,
 * latest sales row, or the fixed mock baseline) differs from the real
 * wall-clock date — i.e. the UI is showing a frozen demo snapshot rather
 * than live, real-time business data (spec Phase 3 §3). */
export function isDemoBusinessDate(businessDate: string, realDate: string = realTodayUtc()): boolean {
  return businessDate !== realDate;
}
