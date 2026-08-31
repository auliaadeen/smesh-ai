import type { ToolName } from "@/tools";

export const productAgent = {
  name: "Product Agent",
  description: "Performa produk, produk underperform, kontribusi terhadap omzet, tren per produk.",
  tools: ["get_product_performance", "get_best_sellers"] as ToolName[],
};
