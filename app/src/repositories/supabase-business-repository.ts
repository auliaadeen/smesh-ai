import type {
  Product,
  TodaySales,
  TodayProductSales,
  SalesComparison,
  BestSeller,
  InventoryAlert,
  ProductPerformance,
} from "@/types/business";
import type { BusinessRepository } from "@/repositories/business-repository";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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
const DEMO_TODAY = "2026-08-31";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

function shiftDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + deltaDays * 86_400_000);
  return formatDate(shifted);
}

function todayDate(): string {
  // Supabase demo data is fixed to August 2026, with the canonical demo date
  // matching MockBusinessRepository/TODAY. Keep the fixed date as the safe
  // production fallback so a missing EdgeOne environment variable cannot make
  // the AI query a future real-world date and return an empty dataset.
  return process.env.SMESH_DEMO_DATE || DEMO_TODAY;
}

function checkError(
  error: { message?: string } | null,
  operation: string
): void {
  if (error) {
    throw new Error(`Supabase ${operation} failed: ${error.message}`);
  }
}

export class SupabaseBusinessRepository implements BusinessRepository {
  async getTodaySales(): Promise<TodaySales> {
    const today = todayDate();
    const { data, error } = await getSupabaseServerClient()
      .from("sales")
      .select("id, product_id, quantity, revenue, sold_at")
      .eq("sold_at", today);
    checkError(error, "getTodaySales");

    const sales = (data ?? []).map((sale) => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: Number(sale.quantity),
      revenue: Number(sale.revenue),
      soldAt: sale.sold_at,
    }));

    return {
      date: today,
      revenue: sumRevenue(sales),
      orders: countOrders(sales),
      unitsSold: sumUnits(sales),
    };
  }

  async getTodayProductSales(limit = 50): Promise<TodayProductSales[]> {
    const today = todayDate();
    const { data: salesData, error: salesError } = await getSupabaseServerClient()
      .from("sales")
      .select("product_id, quantity, revenue, sold_at")
      .eq("sold_at", today);
    checkError(salesError, "getTodayProductSales.sales");

    const { data: productData, error: productError } = await getSupabaseServerClient()
      .from("products")
      .select("id, name")
      .eq("active", true);
    checkError(productError, "getTodayProductSales.products");

    const names = new Map((productData ?? []).map((product) => [product.id, product.name]));
    const grouped = new Map<string, TodayProductSales>();

    for (const sale of salesData ?? []) {
      const existing = grouped.get(sale.product_id);
      if (existing) {
        existing.unitsSold += Number(sale.quantity);
        existing.revenue += Number(sale.revenue);
      } else {
        grouped.set(sale.product_id, {
          productId: sale.product_id,
          productName: names.get(sale.product_id) ?? sale.product_id,
          unitsSold: Number(sale.quantity),
          revenue: Number(sale.revenue),
        });
      }
    }

    return [...grouped.values()]
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, Math.max(0, limit));
  }

  async getSalesComparison(): Promise<SalesComparison> {
    const today = todayDate();
    const comparisonDate = shiftDate(today, -7);
    const { data, error } = await getSupabaseServerClient()
      .from("sales")
      .select("id, product_id, quantity, revenue, sold_at")
      .in("sold_at", [today, comparisonDate]);
    checkError(error, "getSalesComparison");

    const sales = (data ?? []).map((sale) => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: Number(sale.quantity),
      revenue: Number(sale.revenue),
      soldAt: sale.sold_at,
    }));
    const currentSales = sales.filter((sale) => sale.soldAt === today);
    const previousSales = sales.filter((sale) => sale.soldAt === comparisonDate);
    const currentRevenue = sumRevenue(currentSales);
    const previousRevenue = sumRevenue(previousSales);

    return {
      currentRevenue,
      previousRevenue,
      growthPercentage: calculateGrowth(currentRevenue, previousRevenue),
      comparisonPeriod: `hari yang sama minggu lalu (${comparisonDate})`,
    };
  }

  async getBestSellers(limit = 5): Promise<BestSeller[]> {
    const today = todayDate();
    const start = shiftDate(today, -(TRAILING_WINDOW_DAYS - 1));
    const { data: salesData, error: salesError } = await getSupabaseServerClient()
      .from("sales")
      .select("id, product_id, quantity, revenue, sold_at")
      .gte("sold_at", start)
      .lte("sold_at", today);
    checkError(salesError, "getBestSellers.sales");

    const { data: productData, error: productError } = await getSupabaseServerClient()
      .from("products")
      .select("id, name, category, price, cost, active")
      .eq("active", true);
    checkError(productError, "getBestSellers.products");

    const sales = (salesData ?? []).map((sale) => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: Number(sale.quantity),
      revenue: Number(sale.revenue),
      soldAt: sale.sold_at,
    }));
    const products: Product[] = (productData ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      cost: Number(product.cost),
      active: product.active,
    }));

    return rankBestSellers(sales, products, limit);
  }

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const today = todayDate();
    const start = shiftDate(today, -(TRAILING_WINDOW_DAYS - 1));
    const { data: inventoryData, error: inventoryError } = await getSupabaseServerClient()
      .from("inventory")
      .select("product_id, stock, minimum_stock, target_stock");
    checkError(inventoryError, "getInventoryAlerts.inventory");

    const { data: productData, error: productError } = await getSupabaseServerClient()
      .from("products")
      .select("id, name")
      .eq("active", true);
    checkError(productError, "getInventoryAlerts.products");

    const { data: salesData, error: salesError } = await getSupabaseServerClient()
      .from("sales")
      .select("id, product_id, quantity, revenue, sold_at")
      .gte("sold_at", start)
      .lte("sold_at", today);
    checkError(salesError, "getInventoryAlerts.sales");

    const inventory = (inventoryData ?? []).map((item) => ({
      productId: item.product_id,
      stock: Number(item.stock),
      minimumStock: Number(item.minimum_stock),
      targetStock: Number(item.target_stock),
    }));
    const products = new Map((productData ?? []).map((product) => [product.id, product.name]));
    const sales = (salesData ?? []).map((sale) => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: Number(sale.quantity),
      revenue: Number(sale.revenue),
      soldAt: sale.sold_at,
    }));

    return inventory
      .filter(isLowStock)
      .map((inv) => {
        const recentSales = sales.filter(
          (sale) => sale.productId === inv.productId && sale.soldAt >= start && sale.soldAt <= today
        );
        return {
          productId: inv.productId,
          productName: products.get(inv.productId) ?? inv.productId,
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
    const { data, error } = await getSupabaseServerClient()
      .from("products")
      .select("id, name, category, price, cost, active")
      .eq("active", true)
      .order("name");
    checkError(error, "getProducts");

    return (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      cost: Number(product.cost),
      active: product.active,
    }));
  }

  async getProductPerformance(productId?: string): Promise<ProductPerformance[]> {
    const today = todayDate();
    const currentStart = shiftDate(today, -(TRAILING_WINDOW_DAYS - 1));
    const previousEnd = shiftDate(today, -TRAILING_WINDOW_DAYS);
    const previousStart = shiftDate(today, -(2 * TRAILING_WINDOW_DAYS - 1));

    const { data: salesData, error: salesError } = await getSupabaseServerClient()
      .from("sales")
      .select("id, product_id, quantity, revenue, sold_at")
      .gte("sold_at", previousStart)
      .lte("sold_at", today);
    checkError(salesError, "getProductPerformance.sales");

    const { data: productData, error: productError } = await getSupabaseServerClient()
      .from("products")
      .select("id, name, category, price, cost, active")
      .eq("active", true);
    checkError(productError, "getProductPerformance.products");

    const sales = (salesData ?? []).map((sale) => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: Number(sale.quantity),
      revenue: Number(sale.revenue),
      soldAt: sale.sold_at,
    }));
    const products: Product[] = (productData ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      cost: Number(product.cost),
      active: product.active,
    }));
    const currentSales = sales.filter((sale) => sale.soldAt >= currentStart && sale.soldAt <= today);
    const previousSales = sales.filter((sale) => sale.soldAt >= previousStart && sale.soldAt <= previousEnd);
    const performance = buildProductPerformance(currentSales, previousSales, products);

    return productId ? performance.filter((item) => item.productId === productId) : performance;
  }
}

export const supabaseBusinessRepository = new SupabaseBusinessRepository();
