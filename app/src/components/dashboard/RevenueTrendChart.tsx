"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.getUTCDate().toString();
}

function formatRupiah(value: number): string {
  return `Rp${(value / 1000).toLocaleString("id-ID")}rb`;
}

export function RevenueTrendChart({ data }: { data: { date: string; revenue: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatDay(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" vertical={false} />
        <XAxis dataKey="label" stroke="#8a8a8a" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#8a8a8a" fontSize={12} tickFormatter={formatRupiah} width={64} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value) => [`Rp${Number(value).toLocaleString("id-ID")}`, "Omzet"]}
          labelFormatter={(label, payload) => (payload?.[0]?.payload as { date: string })?.date ?? label}
          contentStyle={{
            background: "var(--tooltip-bg)",
            color: "var(--tooltip-fg)",
            border: "1px solid var(--tooltip-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueFill)" name="Omzet" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
