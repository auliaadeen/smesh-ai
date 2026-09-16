import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const rpcMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => ({ rpc: rpcMock }),
}));

// Imported after the mock so the route picks up the mocked Supabase client.
const { POST } = await import("@/app/api/documents/commit/route");

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/documents/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const validLine = { sku: "kopi-arabica", desc: "Kopi Arabica 250g", qty: 3, unit: "Rp45.000", total: "Rp135.000" };

describe("POST /api/documents/commit", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  // Phase 3 acceptance TEST D/E/10 — an invalid payload must never reach the
  // database at all.
  it("never calls the RPC when the payload is invalid", async () => {
    const res = await POST(makeRequest({ transactionType: "sale", date: "invalid-date", lineItems: [validLine] }));
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  // Phase 3 acceptance TEST C — sale transaction, resulting stock surfaced.
  it("commits a valid sale and returns the resulting stock", async () => {
    rpcMock.mockResolvedValueOnce({
      data: { sale_id: "s1", product_id: "kopi-arabica", quantity: 3, revenue: 135000, transaction_type: "sale", date: "2026-09-16", new_stock: 22 },
      error: null,
    });
    const res = await POST(makeRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [validLine] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.results[0].new_stock).toBe(22);
    expect(json.results[0].sale_id).toBe("s1");
  });

  // Phase 3 acceptance TEST B — purchase transaction, no sales ledger row.
  it("commits a valid purchase without a sales ledger row", async () => {
    rpcMock.mockResolvedValueOnce({
      data: { sale_id: null, product_id: "kopi-arabica", quantity: 20, revenue: 900000, transaction_type: "purchase", date: "2026-09-16", new_stock: 45 },
      error: null,
    });
    const res = await POST(makeRequest({ transactionType: "purchase", date: "2026-09-16", lineItems: [{ ...validLine, qty: 20 }] }));
    const json = await res.json();
    expect(json.results[0].transaction_type).toBe("purchase");
    expect(json.results[0].sale_id).toBeNull();
  });

  // Phase 3 acceptance TEST F — insufficient stock must surface as an
  // understandable error, never crash the route or fabricate a success.
  it("surfaces an insufficient-stock RPC error without crashing", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: "insufficient stock for product: kopi-arabica" } });
    const res = await POST(makeRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [validLine] }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/insufficient stock/i);
  });

  // Phase 3 acceptance TEST 11 (invalid product) — an unknown product must
  // never silently succeed.
  it("surfaces an unknown-product RPC error without crashing", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: "unknown active product: SMESH-XYZ" } });
    const res = await POST(makeRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [{ ...validLine, sku: "SMESH-XYZ" }] }));
    expect(res.status).toBe(502);
  });
});
