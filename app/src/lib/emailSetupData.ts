// Data model + mock data untuk modul Email Setup Dashboard.
// Mock-first: bentuk data ngikutin schema Prisma di spec, tapi jalan full in-memory
// (setTimeout simulasi panggilan API) — gampang diganti data-layer beneran nanti
// tanpa ubah UI. Lihat spec-email-setup-dashboard.md Bab 4-5.

export type EmailSetupStatus =
  | "DRAFT"
  | "VERIFICATION_SENT"
  | "VERIFIED"
  | "SENDER_CONFIGURED"
  | "ALIAS_PENDING_MANUAL"
  | "COMPLETED"
  | "FAILED";

export type TimelineEvent = {
  id: string;
  step: string;
  status: "success" | "failed" | "pending";
  message?: string;
  createdAt: string;
};

export type EmailSetupRequest = {
  id: string;
  personalEmail: string;
  targetDomainEmail: string;
  displayName: string;
  status: EmailSetupStatus;
  /** Status sebelum FAILED — dipakai "Coba Lagi" buat tau mesti retry ke mana. */
  statusSebelumGagal?: EmailSetupStatus;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export const STEP_ORDER: { status: EmailSetupStatus; label: string }[] = [
  { status: "VERIFICATION_SENT", label: "Rule Cloudflare Dibuat" },
  { status: "VERIFIED", label: "Verifikasi Email" },
  { status: "SENDER_CONFIGURED", label: "Sender Brevo" },
  { status: "ALIAS_PENDING_MANUAL", label: "Alias Gmail Manual" },
  { status: "COMPLETED", label: "Selesai" },
];

export function stepIndexFor(status: EmailSetupStatus): number {
  if (status === "DRAFT") return -1;
  if (status === "FAILED") return -1;
  return STEP_ORDER.findIndex((s) => s.status === status);
}

export function progressPercent(status: EmailSetupStatus): number {
  const idx = stepIndexFor(status);
  if (idx < 0) return status === "COMPLETED" ? 100 : 0;
  return Math.round(((idx + 1) / STEP_ORDER.length) * 100);
}

function nowIso(): string {
  return new Date().toISOString();
}

function timelineEvent(step: string, status: TimelineEvent["status"], message?: string): TimelineEvent {
  return { id: `TL-${Math.random().toString(36).slice(2, 8)}`, step, status, message, createdAt: nowIso() };
}

// Seed data dieksekusi di module scope, dipanggil ulang saat SSR *dan* saat hydration
// di client — id/timestamp acak (Math.random()/Date.now()) bakal beda tiap panggilan
// dan bikin hydration mismatch. Seed events wajib pakai nilai tetap, bukan timelineEvent().
function seedEvent(
  id: string,
  step: string,
  status: TimelineEvent["status"],
  message: string,
  createdAt: string
): TimelineEvent {
  return { id, step, status, message, createdAt };
}

function nextId(n: number): string {
  return `REQ-${String(n).padStart(3, "0")}`;
}

export const emailSetupRequestsSeed: EmailSetupRequest[] = [
  {
    id: nextId(1),
    personalEmail: "deen@gmail.com",
    targetDomainEmail: "deen@smesh.com",
    displayName: "Deen — Smesh",
    status: "COMPLETED",
    timeline: [
      seedEvent("TL-SEED-01", "Rule Cloudflare Dibuat", "success", "Rule forward dibuat di Cloudflare Email Routing.", "2026-08-10T02:00:00.000Z"),
      seedEvent("TL-SEED-02", "Verifikasi Email", "success", "Cloudflare konfirmasi destination address verified.", "2026-08-10T02:20:00.000Z"),
      seedEvent("TL-SEED-03", "Sender Brevo", "success", "Sender ditambahkan otomatis di Brevo.", "2026-08-10T02:21:00.000Z"),
      seedEvent("TL-SEED-04", "Alias Gmail Manual", "success", "Dikonfirmasi manual oleh user.", "2026-08-10T03:15:00.000Z"),
    ],
    createdAt: "2026-08-10T02:00:00.000Z",
    updatedAt: "2026-08-10T03:15:00.000Z",
  },
  {
    id: nextId(2),
    personalEmail: "franky@gmail.com",
    targetDomainEmail: "franky@smesh.com",
    displayName: "Franky Jonly — Smesh",
    status: "VERIFICATION_SENT",
    timeline: [
      seedEvent("TL-SEED-05", "Rule Cloudflare Dibuat", "success", "Rule forward dibuat di Cloudflare Email Routing.", "2026-08-18T04:00:00.000Z"),
    ],
    createdAt: "2026-08-18T04:00:00.000Z",
    updatedAt: "2026-08-18T04:00:00.000Z",
  },
];

// --- Aksi simulasi (delay ala panggilan API beneran, lihat payrollData.ts utk pola serupa) ---

const DELAY_MS = 900;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));
}

// Cuma dipanggil dari aksi user (klik "Mulai Setup"), gak pernah selama SSR —
// aman pakai counter+random di sini, gak ada risiko hydration mismatch.
let runtimeCounter = emailSetupRequestsSeed.length;
function nextRuntimeId(): string {
  runtimeCounter += 1;
  return nextId(runtimeCounter);
}

export async function mulaiSetup(input: {
  personalEmail: string;
  targetDomainEmail: string;
  displayName: string;
}): Promise<EmailSetupRequest> {
  const req: EmailSetupRequest = {
    id: nextRuntimeId(),
    ...input,
    status: "VERIFICATION_SENT",
    timeline: [timelineEvent("Rule Cloudflare Dibuat", "success", "Rule forward dibuat di Cloudflare Email Routing.")],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return delay(req);
}

export async function cekStatusVerifikasi(req: EmailSetupRequest): Promise<EmailSetupRequest> {
  const timeline = [
    ...req.timeline,
    timelineEvent("Verifikasi Email", "success", "Cloudflare konfirmasi destination address verified."),
    timelineEvent("Sender Brevo", "success", "Sender ditambahkan otomatis di Brevo."),
  ];
  return delay({ ...req, status: "ALIAS_PENDING_MANUAL", timeline, updatedAt: nowIso() });
}

export async function konfirmasiAliasManual(req: EmailSetupRequest): Promise<EmailSetupRequest> {
  const timeline = [...req.timeline, timelineEvent("Alias Gmail Manual", "success", "Dikonfirmasi manual oleh user.")];
  return delay({ ...req, status: "COMPLETED", timeline, updatedAt: nowIso() });
}

export async function simulasikanGagal(req: EmailSetupRequest): Promise<EmailSetupRequest> {
  const step = STEP_ORDER[stepIndexFor(req.status) + 1]?.label ?? "Langkah berikutnya";
  const timeline = [...req.timeline, timelineEvent(step, "failed", "Simulasi kegagalan (demo) — panggilan API gagal.")];
  return delay({ ...req, status: "FAILED", statusSebelumGagal: req.status, timeline, updatedAt: nowIso() });
}

export async function cobaLagi(req: EmailSetupRequest): Promise<EmailSetupRequest> {
  const kembaliKe = req.statusSebelumGagal ?? "DRAFT";
  const timeline = [...req.timeline, timelineEvent("Retry", "pending", "Mencoba ulang step yang gagal.")];
  return delay({ ...req, status: kembaliKe, statusSebelumGagal: undefined, timeline, updatedAt: nowIso() });
}
