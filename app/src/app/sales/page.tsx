import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { Card, KpiCard } from "@/components/ui/Card";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { getBusinessRepository } from "@/repositories";

// Forces per-request Supabase reads instead of a frozen build-time snapshot
// — see src/app/page.tsx for the full root-cause writeup (Phase 4).
export const dynamic = "force-dynamic";

function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default async function SalesPage() {
  const repository = getBusinessRepository();
  const [today, comparison, bestSellers, series] = await Promise.all([
    repository.getTodaySales(),
    repository.getSalesComparison(),
    repository.getBestSellers(5),
    repository.getDailyRevenueSeries(14),
  ]);
  const growthUp = comparison.growthPercentage >= 0;

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Sales Intelligence</p>
        <h1 className="mt-1 text-3xl font-bold">Penjualan hari ini.</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">Sumber data: Smesh Business Repository · {today.date}</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Omzet Hari Ini" value={formatRupiah(today.revenue)} />
          <KpiCard label="Transaksi" value={today.orders.toLocaleString("id-ID")} />
          <KpiCard label="Unit Terjual" value={today.unitsSold.toLocaleString("id-ID")} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tren Omzet — 14 Hari Terakhir</p>
              <span className={`flex items-center gap-1 text-sm font-semibold ${growthUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {growthUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {comparison.growthPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="mb-4 text-xs text-neutral-500">Dibanding {comparison.comparisonPeriod}</p>
            <RevenueTrendChart data={series} />
          </Card>
          <Card>
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"><Trophy className="h-4 w-4 text-amber-500" /> Produk Terlaris (7 hari)</p>
            <div className="space-y-3">
              {bestSellers.map((b, i) => (
                <div key={b.productId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300"><span className="text-xs font-semibold text-neutral-400">#{i + 1}</span>{b.productName}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{b.unitsSold} unit</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
