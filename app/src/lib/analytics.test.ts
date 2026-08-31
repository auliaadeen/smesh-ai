import { describe, it, expect } from "vitest";
import {
  calculateGrowth,
  calculateSalesVelocity,
  isLowStock,
  calculateReorderQuantity,
  classifyUrgency,
  rankBestSellers,
  calculateContribution,
} from "@/lib/analytics";
import type { Sale, Product, Inventory } from "@/types/business";

describe("calculateGrowth", () => {
  it("computes positive growth", () => {
    expect(calculateGrowth(110, 100)).toBeCloseTo(10);
  });

  it("computes negative growth", () => {
    expect(calculateGrowth(80, 100)).toBeCloseTo(-20);
  });

  it("handles zero previous revenue without dividing by zero", () => {
    expect(calculateGrowth(50, 0)).toBe(100);
    expect(calculateGrowth(0, 0)).toBe(0);
  });
});

describe("calculateSalesVelocity", () => {
  it("divides units by days", () => {
    expect(calculateSalesVelocity(70, 7)).toBe(10);
  });

  it("handles zero days without dividing by zero", () => {
    expect(calculateSalesVelocity(70, 0)).toBe(0);
  });
});

describe("isLowStock / calculateReorderQuantity / classifyUrgency", () => {
  const low: Inventory = { productId: "p1", stock: 7, minimumStock: 10, targetStock: 30 };
  const critical: Inventory = { productId: "p2", stock: 2, minimumStock: 10, targetStock: 30 };
  const ok: Inventory = { productId: "p3", stock: 20, minimumStock: 10, targetStock: 30 };

  it("flags stock at/below minimum as low", () => {
    expect(isLowStock(low)).toBe(true);
    expect(isLowStock(ok)).toBe(false);
  });

  it("computes max(target - current, 0)", () => {
    expect(calculateReorderQuantity(low)).toBe(23);
    expect(calculateReorderQuantity(ok)).toBe(10);
  });

  it("classifies urgency", () => {
    expect(classifyUrgency(critical)).toBe("critical");
    expect(classifyUrgency(low)).toBe("warning");
    expect(classifyUrgency(ok)).toBe("normal");
  });
});

describe("rankBestSellers", () => {
  const products: Product[] = [
    { id: "a", name: "A", category: "x", price: 1000, cost: 500, active: true },
    { id: "b", name: "B", category: "x", price: 1000, cost: 500, active: true },
  ];
  const sales: Sale[] = [
    { id: "1", productId: "a", quantity: 5, revenue: 5000, soldAt: "2026-08-01" },
    { id: "2", productId: "b", quantity: 8, revenue: 8000, soldAt: "2026-08-01" },
  ];

  it("ranks by units sold descending", () => {
    const ranked = rankBestSellers(sales, products);
    expect(ranked[0].productId).toBe("b");
    expect(ranked[1].productId).toBe("a");
  });
});

describe("calculateContribution", () => {
  it("computes percentage of total", () => {
    expect(calculateContribution(25, 100)).toBe(25);
  });

  it("handles zero total without dividing by zero", () => {
    expect(calculateContribution(25, 0)).toBe(0);
  });
});
