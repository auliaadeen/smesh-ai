import Link from "next/link";
import { Sparkles, Trophy, AlertTriangle, ArrowRight, TrendingUp, Package, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BusinessHealthSummary } from "@/components/dashboard/BusinessHealthSummary";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";
import { buildRecommendations } from "@/lib/recommendations";

const modules = [
  { href: "/sales", title: "Sales", desc: "Omzet, growth, tren penjualan", icon: TrendingUp },
  { href: "/inventory", title: "Inventory", desc: "Stok kritis & rekomendasi reorder", icon: Package },
  { href: "/products", title: "Products", desc: "Performa & kontribusi tiap produk", icon: LayoutGrid },
];

const PRIORITY_TONE = {
  CRITICAL: "text-red-600 dark:text-red-400",
  WARNING: "text-amber-600 dark:text-amber-400",
  NORMAL: "text-neutral-500",
} as const;

const PRIORITY_LABEL = { CRITICAL: "🔴", WARNING: "🟠", NORMAL: "ℹ️" } as const;

export default async function CommandCenter() {
  const [today, comparison, bestSellers, alerts, series] = await Promise.all([
    mockBusinessRepository.getTodaySales(),
    mockBusinessRepository.getSalesComparison(),
    mockBusinessRepository.getBestSellers(5),
    mockBusinessRepository.getInventoryAlerts(),
    mockBusinessRepository.getDailyRevenueSeries(14),
  ]);

  // "Best seller" as an importance signal for prioritization means the top
  // 1-2 products, not the whole top-5 display list — with only 7 SKUs in
  // the demo catalog, using all 5 would flag nearly every low-stock item as
  // "best seller" and dilute the signal.
  const recommendations = buildRecommendations(alerts, bestSellers.slice(0, 2));

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Business Command Center
        </p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Selamat datang kembali 👋</h1>
        <p className="mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">
          Berikut kondisi bisnis Toko Sejahtera hari ini — Demo Business Data.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/assistant"
            className="flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            <Sparkles className="h-4 w-4" /> Tanya Smesh
          </Link>
        </div>

        <div className="mt-8">
          <BusinessHealthSummary
            revenue={today.revenue}
            growthPercentage={comparison.growthPercentage}
            orders={today.orders}
            bestSellerName={bestSellers[0]?.productName}
            inventoryAlertCount={alerts.length}
            topRecommendation={recommendations[0]}
          />
        </div>

        <Card className="mt-6">
          <p className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Tren Omzet — 14 Hari Terakhir</p>
          <RevenueTrendChart data={series} />
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Trophy className="h-4 w-4 text-amber-500" /> Produk Terlaris
            </p>
            <div className="space-y-3">
              {bestSellers.map((b, i) => (
                <div key={b.productId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="text-xs font-semibold text-neutral-400">#{i + 1}</span>
                    {b.productName}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">{b.unitsSold} unit</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Perlu Perhatian
            </p>
            {alerts.length === 0 ? (
              <p className="text-sm text-neutral-500">Semua stok aman.</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 4).map((a) => (
                  <div key={a.productId} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">{a.productName}</span>
                    <span
                      className={`text-xs font-medium ${
                        a.urgency === "critical" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {a.currentStock} unit
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/inventory"
              className="mt-3 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
        </div>

        <Card className="mt-6">
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">💡 Rekomendasi Smesh</p>
          {recommendations.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada rekomendasi — semua stok dan penjualan normal.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {recommendations.slice(0, 3).map((r) => (
                <li key={r.productId}>
                  <p className={`font-medium ${PRIORITY_TONE[r.priority]}`}>
                    {PRIORITY_LABEL[r.priority]} {r.title}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">{r.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Modul</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-emerald-600/60 dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 group-hover:text-emerald-700 dark:text-white">{m.title}</p>
                    <p className="mt-1 text-sm text-neutral-500">{m.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
