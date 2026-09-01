import type { InventoryAlert, BestSeller } from "@/types/business";

export type RecommendationPriority = "CRITICAL" | "WARNING" | "NORMAL";

export type Recommendation = {
  productId: string;
  productName: string;
  priority: RecommendationPriority;
  title: string;
  reason: string;
  currentStock: number;
  minimumStock: number;
  salesVelocity: number;
  recommendedReorder: number;
};

const PRIORITY_RANK: Record<RecommendationPriority, number> = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };

/**
 * Priority = inventory urgency + sales velocity + product importance (spec
 * Batch 2 Bab 11). A warning-tier alert on a best seller running out fast
 * escalates to CRITICAL even though the raw stock urgency alone is "warning".
 */
export function buildRecommendations(alerts: InventoryAlert[], bestSellers: BestSeller[]): Recommendation[] {
  const bestSellerIds = new Set(bestSellers.map((b) => b.productId));

  return alerts
    .map((alert) => {
      const isBestSeller = bestSellerIds.has(alert.productId);
      const daysOfStockLeft = alert.salesVelocity > 0 ? alert.currentStock / alert.salesVelocity : null;
      const runningOutFast = daysOfStockLeft !== null && daysOfStockLeft <= 3;

      let priority: RecommendationPriority;
      if (alert.urgency === "critical" || (isBestSeller && runningOutFast)) {
        priority = "CRITICAL";
      } else if (alert.urgency === "warning") {
        priority = "WARNING";
      } else {
        priority = "NORMAL";
      }

      const reasonParts: string[] = [];
      if (isBestSeller) reasonParts.push("produk merupakan best seller");
      if (daysOfStockLeft !== null) {
        reasonParts.push(`stok diperkirakan habis dalam ~${daysOfStockLeft.toFixed(1)} hari pada velocity saat ini`);
      } else {
        reasonParts.push("stok sudah di bawah atau mendekati minimum");
      }
      const reason = reasonParts.join(" dan ");

      return {
        productId: alert.productId,
        productName: alert.productName,
        priority,
        title: `Restock ${alert.productName}`,
        reason: reason.charAt(0).toUpperCase() + reason.slice(1) + ".",
        currentStock: alert.currentStock,
        minimumStock: alert.minimumStock,
        salesVelocity: alert.salesVelocity,
        recommendedReorder: alert.recommendedReorder,
      };
    })
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}
