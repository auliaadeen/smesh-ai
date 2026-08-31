import { AlertTriangle, PackageCheck } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";
import type { InventoryAlert } from "@/types/business";

const URGENCY_TONE: Record<InventoryAlert["urgency"], "danger" | "warning" | "neutral"> = {
  critical: "danger",
  warning: "warning",
  normal: "neutral",
};

const URGENCY_LABEL: Record<InventoryAlert["urgency"], string> = {
  critical: "Kritis",
  warning: "Perlu Perhatian",
  normal: "Normal",
};

export default async function InventoryPage() {
  const alerts = await mockBusinessRepository.getInventoryAlerts();

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Inventory Intelligence
        </p>
        <h1 className="mt-1 text-3xl font-bold">Perlu perhatian.</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
          {alerts.length > 0
            ? `${alerts.length} produk mendekati atau di bawah minimum stock. Demo Business Data.`
            : "Semua stok masih di atas minimum. Demo Business Data."}
        </p>

        <div className="mt-8 space-y-4">
          {alerts.length === 0 && (
            <Card className="flex items-center gap-3">
              <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Belum ada produk yang perlu direstock.</p>
            </Card>
          )}

          {alerts.map((a) => (
            <Card key={a.productId} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-700/10 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{a.productName}</p>
                  <p className="text-xs text-neutral-500">
                    Stok {a.currentStock} / minimum {a.minimumStock} · velocity {a.salesVelocity.toFixed(1)} unit/hari
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-12 sm:pl-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">+{a.recommendedReorder} unit</p>
                  <p className="text-xs text-neutral-500">Rekomendasi reorder</p>
                </div>
                <Badge tone={URGENCY_TONE[a.urgency]}>{URGENCY_LABEL[a.urgency]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
