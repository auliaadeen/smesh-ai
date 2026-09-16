// Data model + mock data untuk Mini Slack (spec Part 2 Bab 11).
// Client-side mock, sama pola kayak payrollData.ts / emailSetupData.ts.

export type ChannelSlug = "general" | "document-ai" | "warehouse" | "payroll" | "email-setup";

export type Channel = { slug: ChannelSlug; name: string };

export const CHANNELS: Channel[] = [
  { slug: "general", name: "#general" },
  { slug: "document-ai", name: "#document-ai" },
  { slug: "warehouse", name: "#warehouse" },
  { slug: "payroll", name: "#payroll" },
  { slug: "email-setup", name: "#email-setup" },
];

export type Message = {
  id: string;
  channelSlug: ChannelSlug;
  author: "system" | "deen";
  content: string;
  meta?: string;
  createdAt: string;
};

// Timestamp/id tetap, bukan Date.now()/Math.random() — seed dieksekusi ulang
// saat SSR *dan* hydration client, nilai acak beda tiap panggilan bikin
// hydration mismatch (lihat catatan yang sama di emailSetupData.ts).
export const miniSlackSeed: Message[] = [
  {
    id: "MSG-SEED-01",
    channelSlug: "payroll",
    author: "system",
    content: "💰 Payroll periode Juli 2026 difinalisasi — 4 slip diterbitkan",
    createdAt: "2026-08-01T02:10:00.000Z",
  },
  {
    id: "MSG-SEED-02",
    channelSlug: "email-setup",
    author: "system",
    content: "✉️ Request deen@smesh.com naik status ke COMPLETED",
    createdAt: "2026-08-10T03:15:00.000Z",
  },
  {
    id: "MSG-SEED-03",
    channelSlug: "general",
    author: "deen",
    content: "Selamat datang di Mini Slack — semua event modul kekumpul di sini.",
    createdAt: "2026-08-14T09:00:00.000Z",
  },
];

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay} hari lalu`;
}
