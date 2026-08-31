import type { ToolName } from "@/tools";

export const inventoryAgent = {
  name: "Inventory Agent",
  description: "Status stok, risiko stok habis, sales velocity, rekomendasi reorder.",
  tools: ["get_inventory_alerts", "get_best_sellers", "get_product_performance"] as ToolName[],
};
