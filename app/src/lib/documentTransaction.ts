export type LineItem = { sku: string; desc: string; qty: number; unit: string; total: string };
export type TransactionType = "sale" | "purchase";
export type CommitPayload = { transactionType: TransactionType; date: string; lineItems: LineItem[] };

export type ValidationResult = { ok: true; payload: CommitPayload } | { ok: false; error: string };

const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export function isValidLineItem(item: LineItem): boolean {
  return Boolean(item?.sku?.trim()) && Number.isFinite(Number(item.qty)) && Number(item.qty) > 0;
}

/**
 * Shape/field validation for a Document AI commit request — the same rules
 * `/api/documents/commit` enforces before ever calling the RPC (product
 * existence and stock sufficiency are the RPC's job, not this layer's).
 * Pulled out of the route so it's testable without a Next.js request.
 */
export function validateCommitRequest(
  body: { transactionType?: TransactionType; date?: string; lineItems?: LineItem[] } | null
): ValidationResult {
  const transactionType = body?.transactionType ?? "sale";
  const date = body?.date ?? "";
  const lineItems = body?.lineItems ?? [];

  if (!DATE_PATTERN.test(date)) {
    return { ok: false, error: "Tanggal transaksi tidak valid" };
  }
  if (!["sale", "purchase"].includes(transactionType) || lineItems.length === 0 || !lineItems.every(isValidLineItem)) {
    return { ok: false, error: "Data transaksi tidak lengkap" };
  }
  return { ok: true, payload: { transactionType, date, lineItems } };
}

/** Parses an Indonesian Rupiah-formatted string ("Rp135.000") into a plain
 * number. IDR formatting uses "." as a thousands separator and "," (rarely)
 * as the decimal separator — the opposite of en-US — so a naive
 * `Number(str.replace(/[^0-9.-]/g, ""))` silently reads "Rp135.000" as
 * 135 instead of 135000, undercounting every recorded transaction by 1000x. */
function parseRupiah(value: string): number {
  const cleaned = String(value).replace(/[^0-9.,-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

/** Prefers the line's total; falls back to unit price × quantity. Returns 0
 * (caller must reject) when neither yields a usable positive number. */
export function resolveLineItemRevenue(item: LineItem, qty: number): number {
  const numericUnit = parseRupiah(item.unit);
  const numericTotal = parseRupiah(item.total);
  if (Number.isFinite(numericTotal) && numericTotal > 0) return numericTotal;
  if (Number.isFinite(numericUnit) && numericUnit > 0) return numericUnit * qty;
  return 0;
}
