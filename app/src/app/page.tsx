import Link from "next/link";
import { Sparkles, TrendingUp, Trophy, AlertTriangle, ArrowRight, ShoppingBag, Package, LayoutGrid } from "lucide-react";
import { Card, KpiCard } from "@/components/ui/Card";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";

function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

const modules = [
  { href: "/sales", title: "Sales", desc: "Omzet, growth, tren penjualan", icon: TrendingUp },
  { href: "/inventory", title: "Inventory", desc: "Stok kritis & rekomendasi reorder", icon: Package },
  { href: "/products", title: "Products", desc: "Performa & kontribusi tiap produk", icon: LayoutGrid },
];

export default async function CommandCenter() {
  const [today, comparison, bestSellers, alerts] = await Promise.all([
    mockBusinessRepository.getTodaySales(),
    mockBusinessRepository.getSalesComparison(),
    mockBusinessRepository.getBestSellers(3),
    mockBusinessRepository.getInventoryAlerts(),
  ]);

  const growthUp = comparison.growthPercentage >= 0;
  const topSeller = bestSellers[0];
  const topAlert = alerts[0];

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

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Omzet Hari Ini" value={formatRupiah(today.revenue)} />
          <KpiCard
            label="Growth"
            value={`${comparison.growthPercentage >= 0 ? "+" : ""}${comparison.growthPercentage.toFixed(1)}%`}
            sub={`vs ${comparison.comparisonPeriod}`}
            delta={growthUp ? "naik" : "turun"}
            deltaPositive={growthUp}
          />
          <KpiCard label="Transaksi" value={today.orders.toLocaleString("id-ID")} sub={`${today.unitsSold} unit terjual`} />
          <KpiCard
            icon={alerts.length > 0 ? AlertTriangle : undefined}
            label="Inventory Alerts"
            value={String(alerts.length)}
            sub="Produk perlu direstock"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
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

            <Card className="mt-4">
              <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">💡 Rekomendasi Smesh</p>
              <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                {topAlert && (
                  <li className="flex gap-2">
                    <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    Prioritaskan restock <strong>{topAlert.productName}</strong> — stok {topAlert.currentStock}, sudah{" "}
                    {topAlert.urgency === "critical" ? "kritis" : "mendekati minimum"}.
                  </li>
                )}
                {topSeller && (
                  <li className="flex gap-2">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <strong>{topSeller.productName}</strong> jadi produk terlaris minggu ini ({topSeller.unitsSold} unit) — jaga
                    ketersediaan stoknya.
                  </li>
                )}
                {!topAlert && !topSeller && <li>Belum ada rekomendasi — data bisnis belum cukup.</li>}
              </ul>
            </Card>
          </div>

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

            <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Perlu Perhatian
              </p>
              {alerts.length === 0 ? (
                <p className="text-sm text-neutral-500">Semua stok aman.</p>
              ) : (
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((a) => (
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
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

