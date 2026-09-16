import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getBusinessRepository } from "@/repositories";

// Forces per-request Supabase reads instead of a frozen build-time snapshot
// — see src/app/page.tsx for the full root-cause writeup (Phase 4).
export const dynamic = "force-dynamic";

function formatRupiah(value: number): string { return `Rp${value.toLocaleString("id-ID")}`; }

export default async function ProductsPage() {
  const performance = await getBusinessRepository().getProductPerformance();
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Product Intelligence</p>
        <h1 className="mt-1 text-3xl font-bold">Performa produk — 7 hari terakhir.</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">Nama, unit dan omzet berasal dari data bisnis Smesh.</p>
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800"><th className="py-2 pr-4 font-medium">Produk</th><th className="py-2 pr-4 font-medium">Omzet</th><th className="py-2 pr-4 font-medium">Unit</th><th className="py-2 pr-4 font-medium">Growth</th><th className="py-2 font-medium">Kontribusi</th></tr></thead>
            <tbody>{performance.map((p) => { const up = p.growthPercentage >= 0; return <tr key={p.productId} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
              <td className="py-3 pr-4 font-medium text-neutral-900 dark:text-white">{p.productName}</td>
              <td className="py-3 pr-4 tabular-nums text-neutral-700 dark:text-neutral-300">{formatRupiah(p.revenue)}</td>
              <td className="py-3 pr-4 tabular-nums text-neutral-700 dark:text-neutral-300">{p.unitsSold}</td>
              <td className="py-3 pr-4"><span className={`flex items-center gap-1 tabular-nums ${up ? "text-emerald-600" : "text-red-600"}`}>{up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{p.growthPercentage.toFixed(1)}%</span></td>
              <td className="py-3 tabular-nums text-neutral-700 dark:text-neutral-300">{p.contributionPercentage.toFixed(1)}%</td>
            </tr>; })}</tbody>
          </table>
        </Card>
      </div>
    </main>
  );
}
