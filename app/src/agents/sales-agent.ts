import type { ToolName } from "@/tools";

// Domain boundary only — Batch 1 keeps a single LLM call in business-partner.ts
// and uses these descriptors for routing context/trace labels. Batch 2 can
// evolve each into its own reasoning step without touching the tool layer.
export const salesAgent = {
  name: "Sales Agent",
  description: "Omzet, jumlah transaksi, unit terjual, pertumbuhan, tren penjualan, produk terlaris.",
  tools: ["get_today_sales", "get_sales_comparison", "get_best_sellers", "get_product_performance"] as ToolName[],
};
