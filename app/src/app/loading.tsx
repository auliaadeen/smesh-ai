import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-neutral-500 dark:text-neutral-400">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-sm">Memuat data bisnis…</p>
    </div>
  );
}
