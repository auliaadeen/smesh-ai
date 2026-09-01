"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Recommendation } from "@/lib/recommendations";

function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

const PRIORITY_ICON_TONE: Record<Recommendation["priority"], string> = {
  CRITICAL: "text-red-600 dark:text-red-400",
  WARNING: "text-amber-600 dark:text-amber-400",
  NORMAL: "text-neutral-500",
};

const PRIORITY_LABEL: Record<Recommendation["priority"], string> = {
  CRITICAL: "🔴 Prioritas tinggi",
  WARNING: "🟠 Perlu perhatian",
  NORMAL: "Info",
};

export function BusinessHealthSummary({
  revenue,
  growthPercentage,
  orders,
  bestSellerName,
  inventoryAlertCount,
  topRecommendation,
}: {
  revenue: number;
  growthPercentage: number;
  orders: number;
  bestSellerName?: string;
  inventoryAlertCount: number;
  topRecommendation?: Recommendation;
}) {
  const prefersReducedMotion = useReducedMotion();
  const growthUp = growthPercentage >= 0;

  const tiles = [
    { label: "Omzet", value: formatRupiah(revenue) },
    {
      label: "Growth",
      value: `${growthUp ? "+" : ""}${growthPercentage.toFixed(1)}%`,
      icon: growthUp ? TrendingUp : TrendingDown,
      tone: growthUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
    { label: "Transaksi", value: orders.toLocaleString("id-ID") },
    {
      label: "Stock Risk",
      value: String(inventoryAlertCount),
      icon: inventoryAlertCount > 0 ? AlertTriangle : undefined,
      tone: inventoryAlertCount > 0 ? "text-amber-600 dark:text-amber-400" : undefined,
    },
  ];

  return (
    <Card>
      <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Kondisi Bisnis Hari Ini
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <motion.div
              key={tile.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: prefersReducedMotion ? 0 : i * 0.06 }}
            >
              <p className="text-xs text-neutral-500">{tile.label}</p>
              <p className={`mt-1 flex items-center gap-1 text-xl font-semibold tabular-nums ${tile.tone ?? "text-neutral-900 dark:text-white"}`}>
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {tile.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {bestSellerName && (
        <p className="mt-4 flex items-center gap-1.5 border-t border-neutral-200 pt-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          <Trophy className="h-3.5 w-3.5 text-amber-500" /> Best seller: <strong className="text-neutral-900 dark:text-white">{bestSellerName}</strong>
        </p>
      )}

      {topRecommendation && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: prefersReducedMotion ? 0 : 0.3 }}
          className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <p className={`font-medium ${PRIORITY_ICON_TONE[topRecommendation.priority]}`}>
            {PRIORITY_LABEL[topRecommendation.priority]} — {topRecommendation.title}
          </p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">{topRecommendation.reason}</p>
        </motion.div>
      )}
    </Card>
  );
}
