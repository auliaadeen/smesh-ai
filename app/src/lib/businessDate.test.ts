import { describe, it, expect } from "vitest";
import { isDemoBusinessDate } from "@/lib/businessDate";

// Phase 3 acceptance TEST I — demo-date behavior must be explicit and
// derivable without depending on any specific env var being set.
describe("isDemoBusinessDate", () => {
  it("is true when the business date differs from the real date", () => {
    expect(isDemoBusinessDate("2026-08-31", "2026-09-16")).toBe(true);
  });

  it("is false when the business date matches the real date", () => {
    expect(isDemoBusinessDate("2026-09-16", "2026-09-16")).toBe(false);
  });
});
