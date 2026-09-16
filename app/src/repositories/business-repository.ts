import type {
  Product,
  TodaySales,
  TodayProductSales,
  SalesComparison,
  BestSeller,
  InventoryAlert,
  ProductPerformance,
  Inventory,
  ProductStatus,
} from "@/types/business";

export interface BusinessRepository {
  getTodaySales(): Promise<TodaySales>;
  getTodayProductSales(limit?: number): Promise<TodayProductSales[]>;
  getSalesComparison(): Promise<SalesComparison>;
  getBestSellers(limit?: number): Promise<BestSeller[]>;
  getInventoryAlerts(): Promise<InventoryAlert[]>;
  getInventorySnapshot(): Promise<Inventory[]>;
  getProducts(): Promise<Product[]>;
  getProductPerformance(productId?: string): Promise<ProductPerformance[]>;
  getDailyRevenueSeries(days?: number): Promise<{ date: string; revenue: number }[]>;
  /** Exact-identity lookup for a single named/specific product. Returns
   * null when no product matches — callers must report "not found" and
   * never substitute a different product. */
  getProductStatus(query: string): Promise<ProductStatus | null>;
  /** The business "today" (YYYY-MM-DD) all other queries are anchored to —
   * SMESH_DEMO_DATE when set, else the latest sales date, else the fixed
   * demo baseline. Exposed so the UI can tell a frozen demo date apart from
   * the real wall-clock date instead of silently implying live data. */
  getBusinessDate(): Promise<string>;
}
