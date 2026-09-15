// Domain model Smesh AI — Toko Sejahtera (demo UMKM dataset).

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  active: boolean;
};

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  revenue: number;
  soldAt: string; // ISO date, e.g. "2026-08-31"
};

export type Inventory = {
  productId: string;
  stock: number;
  minimumStock: number;
  targetStock: number;
};

export type TodaySales = {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
};

export type TodayProductSales = {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type SalesComparison = {
  currentRevenue: number;
  previousRevenue: number;
  growthPercentage: number;
  comparisonPeriod: string;
};

export type BestSeller = {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type InventoryAlert = {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  salesVelocity: number;
  recommendedReorder: number;
  urgency: "critical" | "warning" | "normal";
};

export type ProductPerformance = {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
  growthPercentage: number;
  contributionPercentage: number;
};

// Exact-identity lookup result for a single named/specific product query
// (spec Batch 2.1 Q7/Q8 — never substitute a different product when the
// requested one isn't found).
export type ProductStatus = {
  productId: string;
  productName: string;
  category: string;
  price: number;
  active: boolean;
  currentStock: number;
  minimumStock: number;
  targetStock: number;
  isLowStock: boolean;
};
