import type { Sale, Inventory, Product, BestSeller, ProductPerformance } from "@/types/business";

/** Sum revenue across sales. */
export function sumRevenue(sales: Sale[]): number {
  return sales.reduce((total, s) => total + s.revenue, 0);
}

/** Sum quantity across sales. */
export function sumUnits(sales: Sale[]): number {
  return sales.reduce((total, s) => total + s.quantity, 0);
}

/** Count of sale/transaction records. */
export function countOrders(sales: Sale[]): number {
  return sales.length;
}

/** ((current - previous) / previous) * 100, safe against divide-by-zero. */
export function calculateGrowth(currentRevenue: number, previousRevenue: number): number {
  if (previousRevenue === 0) {
    return currentRevenue === 0 ? 0 : 100;
  }
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
}

/** units sold / number of days, safe against divide-by-zero. */
export function calculateSalesVelocity(unitsSold: number, days: number): number {
  if (days <= 0) return 0;
  return unitsSold / days;
}

export function isLowStock(inventory: Inventory): boolean {
  return inventory.stock <= inventory.minimumStock;
}

/** max(targetStock - currentStock, 0) */
export function calculateReorderQuantity(inventory: Inventory): number {
  return Math.max(inventory.targetStock - inventory.stock, 0);
}

export function classifyUrgency(inventory: Inventory): "critical" | "warning" | "normal" {
  if (!isLowStock(inventory)) return "normal";
  return inventory.stock <= inventory.minimumStock * 0.5 ? "critical" : "warning";
}

/** Rank products by units sold (desc), revenue as tiebreaker. */
export function rankBestSellers(sales: Sale[], products: Product[], limit = 5): BestSeller[] {
  const byProduct = new Map<string, { unitsSold: number; revenue: number }>();
  for (const s of sales) {
    const acc = byProduct.get(s.productId) ?? { unitsSold: 0, revenue: 0 };
    acc.unitsSold += s.quantity;
    acc.revenue += s.revenue;
    byProduct.set(s.productId, acc);
  }

  const productName = new Map(products.map((p) => [p.id, p.name]));

  return Array.from(byProduct.entries())
    .map(([productId, agg]) => ({
      productId,
      productName: productName.get(productId) ?? productId,
      unitsSold: agg.unitsSold,
      revenue: agg.revenue,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
    .slice(0, limit);
}

/** product revenue / total revenue * 100, safe against zero total. */
export function calculateContribution(productRevenue: number, totalRevenue: number): number {
  if (totalRevenue === 0) return 0;
  return (productRevenue / totalRevenue) * 100;
}

export function buildProductPerformance(
  currentSales: Sale[],
  previousSales: Sale[],
  products: Product[]
): ProductPerformance[] {
  const totalRevenue = sumRevenue(currentSales);

  const currentByProduct = new Map<string, { unitsSold: number; revenue: number }>();
  for (const s of currentSales) {
    const acc = currentByProduct.get(s.productId) ?? { unitsSold: 0, revenue: 0 };
    acc.unitsSold += s.quantity;
    acc.revenue += s.revenue;
    currentByProduct.set(s.productId, acc);
  }

  const previousRevenueByProduct = new Map<string, number>();
  for (const s of previousSales) {
    previousRevenueByProduct.set(s.productId, (previousRevenueByProduct.get(s.productId) ?? 0) + s.revenue);
  }

  return products
    .filter((p) => currentByProduct.has(p.id))
    .map((p) => {
      const agg = currentByProduct.get(p.id)!;
      const previousRevenue = previousRevenueByProduct.get(p.id) ?? 0;
      return {
        productId: p.id,
        productName: p.name,
        revenue: agg.revenue,
        unitsSold: agg.unitsSold,
        growthPercentage: calculateGrowth(agg.revenue, previousRevenue),
        contributionPercentage: calculateContribution(agg.revenue, totalRevenue),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}
