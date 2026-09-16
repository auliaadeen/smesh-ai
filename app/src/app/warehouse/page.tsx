import { Package, AlertTriangle, Boxes, ArrowDownToLine } from "lucide-react";
import { Card, KpiCard, Badge } from "@/components/ui/Card";
import { getBusinessRepository } from "@/repositories";
import { calculateReorderQuantity, classifyUrgency, isLowStock } from "@/lib/analytics";

// Forces per-request Supabase reads instead of a frozen build-time snapshot
// — see src/app/page.tsx for the full root-cause writeup (Phase 4).
export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  const repository = getBusinessRepository();
  const [inventory, products] = await Promise.all([
    repository.getInventorySnapshot(),
    repository.getProducts(),
  ]);
  const names = new Map(products.map(p => [p.id, p]));
  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStock = inventory.filter(isLowStock);
  const targetGap = inventory.reduce((sum, item) => sum + calculateReorderQuantity(item), 0);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Smesh Warehouse</p>
        <h1 className="mt-1 text-3xl font-bold">Satu layar untuk kondisi stok.</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Smesh Inventory Intelligence untuk kondisi gudangmu. Angka berasal dari Supabase yang sama dengan AI Business Partner.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard icon={Boxes} label="Total Stok" value={totalStock.toLocaleString("id-ID")} sub="unit saat ini" />
          <KpiCard icon={AlertTriangle} label="Stok Kritis" value={String(lowStock.length)} sub="produk di bawah minimum" />
          <KpiCard icon={ArrowDownToLine} label="Gap ke Target" value={targetGap.toLocaleString("id-ID")} sub="unit yang perlu dipenuhi" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-x-auto">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Warehouse Stock Snapshot</p>
              <span className="text-xs text-neutral-500">{inventory.length} SKU</span>
            </div>
            <table className="w-full min-w-[620px] text-sm">
              <thead><tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
                <th className="py-2 pr-4">Produk</th><th className="py-2 pr-4">Kategori</th><th className="py-2 pr-4">Stok</th><th className="py-2 pr-4">Minimum</th><th className="py-2">Target</th>
              </tr></thead>
              <tbody>{inventory.map(item => {
                const product = names.get(item.productId);
                const critical = classifyUrgency(item) === "critical";
                return <tr key={item.productId} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                  <td className="py-3 pr-4 font-medium">{product?.name ?? item.productId}</td>
                  <td className="py-3 pr-4 text-neutral-500">{product?.category ?? "—"}</td>
                  <td className={`py-3 pr-4 font-semibold ${critical ? "text-red-600 dark:text-red-400" : ""}`}>{item.stock}</td>
                  <td className="py-3 pr-4 text-neutral-500">{item.minimumStock}</td>
                  <td className="py-3">{item.targetStock}</td>
                </tr>;
              })}</tbody>
            </table>
          </Card>

          <Card>
            <p className="mb-4 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"><Package className="h-4 w-4" /> Perlu Tindakan</p>
            <div className="space-y-3">
              {lowStock.length === 0 && <p className="text-sm text-neutral-500">Semua stok di atas minimum.</p>}
              {lowStock.map(item => {
                const product = names.get(item.productId);
                const urgency = classifyUrgency(item);
                const reorder = calculateReorderQuantity(item);
                return <div key={item.productId} className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{product?.name ?? item.productId}</p>
                    <Badge tone={urgency === "critical" ? "danger" : "warning"}>{urgency === "critical" ? "Critical" : "Low"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Stok {item.stock} · minimum {item.minimumStock} · rekomendasi +{reorder} unit</p>
                </div>;
              })}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
