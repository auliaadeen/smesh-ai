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

  // Batch 2.1 acceptance TEST A — a specific existing product resolves to
  // only that product's data.
  it("getProductStatus resolves an existing product by partial name", async () => {
    const status = await mockBusinessRepository.getProductStatus("Kopi Arabica");
    expect(status).not.toBeNull();
    expect(status?.productId).toBe("kopi-arabica");
    expect(status?.productName).toBe("Kopi Arabica 250g");
  });

  it("getProductStatus resolves an existing product by exact id", async () => {
    const status = await mockBusinessRepository.getProductStatus("kopi-arabica");
    expect(status?.productId).toBe("kopi-arabica");
  });

  // Batch 2.1 acceptance TEST B — a fictional/unknown product must return
  // null, never a substituted real product.
  it("getProductStatus returns null for a fictional product", async () => {
    const status = await mockBusinessRepository.getProductStatus("SMESH-XYZ");
    expect(status).toBeNull();
  });

  it("getProductStatus returns null for an ambiguous partial match", async () => {
    // "Kopi" alone matches both Kopi Arabica and Kopi Robusta — must not
    // silently pick one.
    const status = await mockBusinessRepository.getProductStatus("Kopi");
    expect(status).toBeNull();
  });
});
