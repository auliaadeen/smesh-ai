import type {
  Product,
  TodaySales,
  SalesComparison,
  BestSeller,
  InventoryAlert,
  ProductPerformance,
} from "@/types/business";

// Agent/tool layer depends on this interface only — never on raw mock
// arrays — so a future SupabaseBusinessRepository can swap in without
// touching agents, tools, or the API route.
export interface BusinessRepository {
  getTodaySales(): Promise<TodaySales>;
  getSalesComparison(): Promise<SalesComparison>;
  getBestSellers(limit?: number): Promise<BestSeller[]>;
  getInventoryAlerts(): Promise<InventoryAlert[]>;
  getProducts(): Promise<Product[]>;
  getProductPerformance(productId?: string): Promise<ProductPerformance[]>;
}
