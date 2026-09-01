"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Send, Loader2, Bot, User, ShieldCheck } from "lucide-react";

const CONTOH_PERTANYAAN = [
  "📊 Cek penjualan hari ini",
  "📦 Apa yang harus direstock?",
  "📈 Produk mana yang sedang naik?",
  "💡 Apa yang harus saya lakukan hari ini?",
];

type ChatMsg = { role: "user" | "assistant"; content: string; agentsUsed?: string[]; isError?: boolean };

export default function AssistantPage() {
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  async function kirim(pertanyaan: string) {
    const cleaned = pertanyaan.replace(/^[^\w]+/, "").trim();
    if (!cleaned || loading) return;
    const history = chat.map((m) => ({ role: m.role, content: m.content }));
    setChat((prev) => [...prev, { role: "user", content: cleaned }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleaned, history }),
      });
      const json = await res.json();
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: json.answer ?? "Maaf, gagal dapat jawaban.", agentsUsed: json.agentsUsed },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Smesh sedang mengalami kendala saat memproses pertanyaan. Coba lagi beberapa saat.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-white px-6 py-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:px-12">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col min-h-0">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" /> Smesh Business Partner
        </p>
        <h1 className="mt-1 text-2xl font-bold">Tanya Smesh soal bisnismu.</h1>

        <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          {chat.length === 0 && (
            <div>
              <p className="text-sm text-neutral-500">Contoh: Gimana penjualan saya hari ini?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTOH_PERTANYAAN.map((q) => (
                  <button
                    key={q}
                    onClick={() => kirim(q)}
                    className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((m, i) => (
            <motion.div
              key={i}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-600 dark:text-emerald-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white"
                    : m.isError
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                }`}
              >
                {m.content}
                {m.agentsUsed && m.agentsUsed.length > 0 && (
                  <p className="mt-2 flex items-center gap-1 border-t border-black/10 pt-2 text-[11px] text-neutral-500 dark:border-white/10">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    Berdasarkan: {m.agentsUsed.map((a) => `✓ ${a}`).join("  ·  ")}
                  </p>
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Smesh sedang menganalisis bisnismu...
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && kirim(input)}
            placeholder="Contoh: Gimana penjualan saya hari ini?"
            className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-3 py-2.5 text-sm"
          />
          <button
            onClick={() => kirim(input)}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Jawaban berbasis Demo Business Data — angka bersumber dari data bisnis, bukan karangan AI.
        </p>
      </div>
    </main>
  );
}
