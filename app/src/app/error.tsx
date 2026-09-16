"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// App Router error boundary for this segment — catches a thrown error from
// any Server Component below it (e.g. Supabase unreachable) and shows an
// understandable message instead of Next's default overlay/stack trace.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[smesh] page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-neutral-900 dark:text-white">Data bisnis tidak bisa dimuat saat ini.</p>
      <p className="max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
        Kemungkinan Supabase sedang tidak terjangkau. Coba lagi sebentar lagi.
      </p>
      <button
        onClick={reset}
        className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Coba lagi
      </button>
    </div>
  );
}
