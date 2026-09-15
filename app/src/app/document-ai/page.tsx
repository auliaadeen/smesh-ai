"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { UploadCloud, FileText, CheckCircle2, Loader2, Save, RotateCcw } from "lucide-react";
import { useMiniSlack } from "@/lib/MiniSlackContext";

type Stage = "idle" | "processing" | "review" | "committed";
type LineItem = { sku: string; desc: string; qty: number; unit: string; total: string };
type ExtractResult = { source: string; documentType?: string; confidence?: number | null; fields: { label: string; value: string }[]; lineItems: LineItem[] };

function todayIso() { return new Date().toISOString().slice(0, 10); }
function fieldValue(fields: ExtractResult["fields"], label: string, fallback = "") { return fields.find(f => f.label.toLowerCase() === label.toLowerCase())?.value ?? fallback; }

export default function DocumentAiPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [transactionDate, setTransactionDate] = useState(todayIso());
  const [transactionType, setTransactionType] = useState<"sale" | "purchase">("sale");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { post } = useMiniSlack();

  async function handleFile(file: File) {
    setFileName(file.name); setStage("processing"); setMessage("");
    const formData = new FormData(); formData.append("file", file);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.lineItems) throw new Error(json.error ?? "Ekstraksi gagal");
      setResult(json); setTransactionDate(todayIso()); setStage("review");
    } catch (error) {
      setResult(null); setMessage(error instanceof Error ? error.message : "Ekstraksi gagal"); setStage("idle");
    }
  }

  function updateLine(index: number, key: keyof LineItem, value: string) {
    setResult(prev => prev ? { ...prev, lineItems: prev.lineItems.map((item, i) => i === index ? { ...item, [key]: key === "qty" ? Number(value) : value } : item) } : prev);
  }

  async function confirm() {
    if (!result || result.lineItems.length === 0) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/documents/commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transactionType, date: transactionDate, lineItems: result.lineItems }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan transaksi");
      setStage("committed"); setMessage(json.items + " item berhasil masuk ke business data.");
      post("document-ai", "📄 " + fileName + " dikonfirmasi: " + json.items + " item " + transactionType + " pada " + transactionDate, "document.processed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan transaksi");
    } finally { setBusy(false); }
  }

  function reset() { setStage("idle"); setResult(null); setFileName(""); setMessage(""); setTransactionDate(todayIso()); }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Document AI</p>
        <h1 className="mt-1 text-3xl font-bold">Dari dokumen menjadi business data.</h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">Upload → ekstraksi → review/edit → confirm → update Supabase. Ini adalah transformasi capability Document AI dari HTI ke workflow Smesh.</p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {stage === "idle" && <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                  <UploadCloud className="mb-4 h-10 w-10 text-neutral-500" />
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">Upload foto struk/invoice atau gunakan data demo.</p>
                  <button onClick={() => inputRef.current?.click()} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">Pilih Dokumen</button>
                  <button onClick={() => handleFile(new File([""], "sample-receipt-smesh.jpg", { type: "image/jpeg" }))} className="mt-3 text-xs text-neutral-500 underline">Coba demo extraction</button>
                  <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </motion.div>}
                {stage === "processing" && <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center"><Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-500" /><p className="text-sm">Mengekstrak {fileName}…</p><p className="mt-1 text-xs text-neutral-500">OpenAI Vision atau deterministic demo fallback</p></motion.div>}
                {stage === "review" && <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center"><CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" /><p className="text-sm font-medium">Siap direview</p><p className="mt-1 text-xs text-neutral-500">{fileName}</p></motion.div>}
                {stage === "committed" && <motion.div key="committed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center"><CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" /><p className="text-sm font-medium">Business data updated</p><button onClick={reset} className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500 underline"><RotateCcw className="h-3 w-3" /> Upload lagi</button></motion.div>}
              </AnimatePresence>
              {message && <p className="mt-5 max-w-xs text-xs text-amber-600 dark:text-amber-400">{message}</p>}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4" /> Review Extraction</p>{result && <span className="text-xs text-neutral-500">source: {result.source}</span>}</div>
            {!result ? <p className="mt-6 text-sm text-neutral-500">Belum ada dokumen.</p> : <>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-xs text-neutral-500">Tipe transaksi<select value={transactionType} onChange={e => setTransactionType(e.target.value as "sale" | "purchase")} className="mt-1 block w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"><option value="sale">Penjualan</option><option value="purchase">Pembelian / restock</option></select></label>
                <label className="text-xs text-neutral-500">Tanggal bisnis<input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white" /></label>
                <div className="rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-900"><p className="text-[11px] text-neutral-500">Dokumen</p><p className="mt-1 text-sm font-medium">{fieldValue(result.fields, "Document No.", fileName)}</p></div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead><tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500 dark:border-neutral-800"><th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">Produk</th><th className="py-2 pr-3">Qty</th><th className="py-2 pr-3">Harga/unit</th><th className="py-2">Total</th></tr></thead>
                  <tbody>{result.lineItems.map((item, index) => <tr key={index} className="border-b border-neutral-100 dark:border-neutral-900">
                    {(["sku","desc","qty","unit","total"] as const).map(key => <td key={key} className="py-2 pr-3"><input value={String(item[key])} onChange={e => updateLine(index, key, e.target.value)} className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950" /></td>)}
                  </tr>)}</tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button onClick={reset} disabled={busy} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">Batal</button>
                <button onClick={confirm} disabled={busy || stage === "committed"} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Confirm & Update Business Data</button>
              </div>
            </>}
          </Card>
        </div>
      </div>
    </main>
  );
}
