import type { ToolName } from "@/tools";

// Sales domain boundary. Tools are deliberately explicit about their time
// windows so the LLM cannot confuse today's product breakdown with the
// trailing-7-day best-seller aggregate.
export const salesAgent = {
  name: "Sales Agent",
  description: "Omzet, jumlah transaksi, unit terjual, pertumbuhan, tren penjualan, dan produk terlaris.",
  tools: ["get_today_sales", "get_today_product_sales", "get_sales_comparison", "get_best_sellers", "get_product_performance"] as ToolName[],
};
