import { describe, it, expect } from "vitest";
import { buildRecommendations } from "@/lib/recommendations";
import type { InventoryAlert, BestSeller } from "@/types/business";

const bestSellers: BestSeller[] = [{ productId: "kopi-arabica", productName: "Kopi Arabica", unitsSold: 177, revenue: 7965000 }];

describe("buildRecommendations", () => {
  it("keeps a critical urgency alert as CRITICAL priority", () => {
    const alerts: InventoryAlert[] = [
      {
        productId: "choco-powder",
        productName: "Chocolate Powder",
        currentStock: 4,
        minimumStock: 10,
        salesVelocity: 6.4,
        recommendedReorder: 36,
        urgency: "critical",
      },
    ];
    const [rec] = buildRecommendations(alerts, bestSellers);
    expect(rec.priority).toBe("CRITICAL");
  });

  it("escalates a warning-tier best seller running out fast to CRITICAL", () => {
    const alerts: InventoryAlert[] = [
      {
        productId: "kopi-arabica",
        productName: "Kopi Arabica",
        currentStock: 6,
        minimumStock: 30,
        salesVelocity: 25,
        recommendedReorder: 75,
        urgency: "warning",
      },
    ];
    const [rec] = buildRecommendations(alerts, bestSellers);
    expect(rec.priority).toBe("CRITICAL");
    expect(rec.reason).toMatch(/best seller/);
  });

  it("keeps a warning-tier non-best-seller with slow depletion at WARNING", () => {
    const alerts: InventoryAlert[] = [
      {
        productId: "gula-aren",
        productName: "Gula Aren",
        currentStock: 15,
        minimumStock: 20,
        salesVelocity: 1,
        recommendedReorder: 45,
        urgency: "warning",
      },
    ];
    const [rec] = buildRecommendations(alerts, bestSellers);
    expect(rec.priority).toBe("WARNING");
  });

  it("sorts CRITICAL before WARNING", () => {
    const alerts: InventoryAlert[] = [
      { productId: "a", productName: "A", currentStock: 15, minimumStock: 20, salesVelocity: 1, recommendedReorder: 5, urgency: "warning" },
      { productId: "b", productName: "B", currentStock: 2, minimumStock: 10, salesVelocity: 3, recommendedReorder: 30, urgency: "critical" },
    ];
    const result = buildRecommendations(alerts, []);
    expect(result[0].productId).toBe("b");
  });
});
