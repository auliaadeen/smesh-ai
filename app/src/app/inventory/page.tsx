import { AlertTriangle, PackageCheck } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { getBusinessRepository } from "@/repositories";
import { buildRecommendations, type RecommendationPriority } from "@/lib/recommendations";

// Forces per-request Supabase reads instead of a frozen build-time snapshot
// — see src/app/page.tsx for the full root-cause writeup (Phase 4).
export const dynamic = "force-dynamic";

const PRIORITY_TONE: Record<RecommendationPriority, "danger" | "warning" | "neutral"> = { CRITICAL: "danger", WARNING: "warning", NORMAL: "neutral" };
const PRIORITY_LABEL: Record<RecommendationPriority, string> = { CRITICAL: "🔴 Prioritas Tinggi", WARNING: "🟠 Perlu Perhatian", NORMAL: "Info" };

export default async function InventoryPage() {
  const repository = getBusinessRepository();
  const [alerts, bestSellers] = await Promise.all([repository.getInventoryAlerts(), repository.getBestSellers(5)]);
  const recommendations = buildRecommendations(alerts, bestSellers.slice(0, 2));

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Inventory Intelligence</p>
        <h1 className="mt-1 text-3xl font-bold">Stok & rekomendasi pembelian.</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">Angka di bawah berasal dari repository yang sama dengan AI Business Partner.</p>
        <div className="mt-8 space-y-4">
          {recommendations.length === 0 && <Card className="flex items-center gap-3"><PackageCheck className="h-5 w-5 text-emerald-600" /><p className="text-sm text-neutral-600 dark:text-neutral-400">Semua stok aman.</p></Card>}
          {recommendations.map((r) => (
            <Card key={r.productId} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-700/10 text-amber-600"><AlertTriangle className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{r.productName}</p>
                  <p className="text-xs text-neutral-500">Stok {r.currentStock} / minimum {r.minimumStock} · velocity {r.salesVelocity.toFixed(1)} unit/hari</p>
                  <p className="mt-1 max-w-md text-xs text-neutral-500">{r.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-12 sm:pl-0"><div className="text-right"><p className="text-sm font-semibold text-neutral-900 dark:text-white">+{r.recommendedReorder} unit</p><p className="text-xs text-neutral-500">Rekomendasi reorder</p></div><Badge tone={PRIORITY_TONE[r.priority]}>{PRIORITY_LABEL[r.priority]}</Badge></div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
