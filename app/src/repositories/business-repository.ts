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
}
