import { describe, it, expect } from "vitest";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";

describe("MockBusinessRepository", () => {
  it("returns non-empty products", async () => {
    const products = await mockBusinessRepository.getProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it("returns deterministic today sales", async () => {
    const a = await mockBusinessRepository.getTodaySales();
    const b = await mockBusinessRepository.getTodaySales();
    expect(a).toEqual(b);
    expect(a.revenue).toBeGreaterThan(0);
    expect(a.orders).toBeGreaterThan(0);
  });

  it("returns inventory alerts only for low-stock products", async () => {
    const alerts = await mockBusinessRepository.getInventoryAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    for (const a of alerts) {
      expect(a.currentStock).toBeLessThanOrEqual(a.minimumStock);
    }
  });

  it("returns best sellers sorted by units sold descending", async () => {
    const bestSellers = await mockBusinessRepository.getBestSellers(3);
    expect(bestSellers.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < bestSellers.length; i++) {
      expect(bestSellers[i - 1].unitsSold).toBeGreaterThanOrEqual(bestSellers[i].unitsSold);
    }
  });

  it("filters product performance by productId", async () => {
    const all = await mockBusinessRepository.getProductPerformance();
    const single = await mockBusinessRepository.getProductPerformance(all[0].productId);
    expect(single).toHaveLength(1);
    expect(single[0].productId).toBe(all[0].productId);
  });
});
