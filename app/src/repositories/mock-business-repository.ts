import type {
  Product,
  Sale,
  TodaySales,
  SalesComparison,
  BestSeller,
  InventoryAlert,
  ProductPerformance,
} from "@/types/business";
import type { BusinessRepository } from "@/repositories/business-repository";
import { PRODUCTS } from "@/data/products";
import { INVENTORY } from "@/data/inventory";
import { SALES, TODAY } from "@/data/sales";
import {
  sumRevenue,
  sumUnits,
  countOrders,
  calculateGrowth,
  calculateSalesVelocity,
  calculateReorderQuantity,
  classifyUrgency,
  isLowStock,
  rankBestSellers,
  buildProductPerformance,
} from "@/lib/analytics";

const TRAILING_WINDOW_DAYS = 7;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function shiftDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + deltaDays * 86_400_000);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

function salesOn(date: string): Sale[] {
  return SALES.filter((s) => s.soldAt === date);
}

function salesBetween(start: string, end: string): Sale[] {
  return SALES.filter((s) => s.soldAt >= start && s.soldAt <= end);
}

function salesForProductBetween(productId: string, start: string, end: string): Sale[] {
  return SALES.filter((s) => s.productId === productId && s.soldAt >= start && s.soldAt <= end);
}

const productName = new Map(PRODUCTS.map((p) => [p.id, p.name]));

export class MockBusinessRepository implements BusinessRepository {
  async getTodaySales(): Promise<TodaySales> {
    const todaySales = salesOn(TODAY);
    return {
      date: TODAY,
      revenue: sumRevenue(todaySales),
      orders: countOrders(todaySales),
      unitsSold: sumUnits(todaySales),
    };
  }

  async getSalesComparison(): Promise<SalesComparison> {
    const comparisonDate = shiftDate(TODAY, -7);
    const currentRevenue = sumRevenue(salesOn(TODAY));
    const previousRevenue = sumRevenue(salesOn(comparisonDate));
    return {
      currentRevenue,
      previousRevenue,
      growthPercentage: calculateGrowth(currentRevenue, previousRevenue),
      comparisonPeriod: `hari yang sama minggu lalu (${comparisonDate})`,
    };
  }

  async getBestSellers(limit = 5): Promise<BestSeller[]> {
    const start = shiftDate(TODAY, -(TRAILING_WINDOW_DAYS - 1));
    return rankBestSellers(salesBetween(start, TODAY), PRODUCTS, limit);
  }

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const start = shiftDate(TODAY, -(TRAILING_WINDOW_DAYS - 1));

    return INVENTORY.filter(isLowStock)
      .map((inv) => {
        const recentSales = salesForProductBetween(inv.productId, start, TODAY);
        return {
          productId: inv.productId,
          productName: productName.get(inv.productId) ?? inv.productId,
          currentStock: inv.stock,
          minimumStock: inv.minimumStock,
          salesVelocity: calculateSalesVelocity(sumUnits(recentSales), TRAILING_WINDOW_DAYS),
          recommendedReorder: calculateReorderQuantity(inv),
          urgency: classifyUrgency(inv),
        };
      })
      .sort((a, b) => {
        const rank = { critical: 0, warning: 1, normal: 2 };
        return rank[a.urgency] - rank[b.urgency] || a.currentStock - b.currentStock;
      });
  }

  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  }

  /**
   * Not part of BusinessRepository — dashboard-only helper for the revenue
   * trend chart. Kept here (not in page components) so the daily-series
   * math has one source of truth alongside the rest of the analytics.
   */
  async getDailyRevenueSeries(days = 14): Promise<{ date: string; revenue: number }[]> {
    const series: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = shiftDate(TODAY, -i);
      series.push({ date, revenue: sumRevenue(salesOn(date)) });
    }
    return series;
  }

  async getProductPerformance(productId?: string): Promise<ProductPerformance[]> {
    const currentStart = shiftDate(TODAY, -(TRAILING_WINDOW_DAYS - 1));
    const previousEnd = shiftDate(TODAY, -TRAILING_WINDOW_DAYS);
    const previousStart = shiftDate(TODAY, -(2 * TRAILING_WINDOW_DAYS - 1));

    const currentSales = salesBetween(currentStart, TODAY);
    const previousSales = salesBetween(previousStart, previousEnd);

    const performance = buildProductPerformance(currentSales, previousSales, PRODUCTS);
    return productId ? performance.filter((p) => p.productId === productId) : performance;
  }
}

export const mockBusinessRepository = new MockBusinessRepository();
