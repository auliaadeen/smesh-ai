import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  deltaPositive = true,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("transition-colors hover:border-neutral-300 dark:hover:border-neutral-700", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-600 dark:text-emerald-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "mb-0.5 text-xs font-medium",
              deltaPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
