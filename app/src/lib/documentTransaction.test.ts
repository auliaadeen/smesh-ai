import { describe, it, expect } from "vitest";
import { validateCommitRequest, resolveLineItemRevenue, isValidLineItem } from "@/lib/documentTransaction";

const validLine = { sku: "kopi-arabica", desc: "Kopi Arabica 250g", qty: 3, unit: "Rp45.000", total: "Rp135.000" };

// Phase 3 acceptance TEST A/D/E — Document AI commit payload validation.
describe("validateCommitRequest", () => {
  it("accepts a valid sale payload", () => {
    const result = validateCommitRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [validLine] });
    expect(result.ok).toBe(true);
  });

  it("accepts a valid purchase payload", () => {
    const result = validateCommitRequest({ transactionType: "purchase", date: "2026-09-16", lineItems: [{ ...validLine, qty: 20 }] });
    expect(result.ok).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(validateCommitRequest({ transactionType: "sale", date: "16-09-2026", lineItems: [validLine] }).ok).toBe(false);
  });

  it("rejects a missing date", () => {
    expect(validateCommitRequest({ transactionType: "sale", lineItems: [validLine] }).ok).toBe(false);
  });

  it("rejects an empty line-item list", () => {
    expect(validateCommitRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [] }).ok).toBe(false);
  });

  it("rejects a zero quantity line item", () => {
    expect(validateCommitRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [{ ...validLine, qty: 0 }] }).ok).toBe(false);
  });

  it("rejects a negative quantity line item", () => {
    expect(validateCommitRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [{ ...validLine, qty: -5 }] }).ok).toBe(false);
  });

  it("rejects a line item with no SKU", () => {
    expect(validateCommitRequest({ transactionType: "sale", date: "2026-09-16", lineItems: [{ ...validLine, sku: "  " }] }).ok).toBe(false);
  });

  it("rejects an unsupported transaction type", () => {
    expect(
      validateCommitRequest({ transactionType: "refund" as never, date: "2026-09-16", lineItems: [validLine] }).ok
    ).toBe(false);
  });

  it("defaults to sale when transactionType is omitted", () => {
    const result = validateCommitRequest({ date: "2026-09-16", lineItems: [validLine] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.transactionType).toBe("sale");
  });
});

describe("resolveLineItemRevenue", () => {
  it("prefers the line total when present", () => {
    expect(resolveLineItemRevenue({ ...validLine, unit: "Rp45.000", total: "Rp135.000" }, 3)).toBe(135000);
  });

  it("falls back to unit price times quantity when total is missing", () => {
    expect(resolveLineItemRevenue({ ...validLine, unit: "Rp45.000", total: "" }, 3)).toBe(135000);
  });

  it("returns 0 when neither total nor unit price is usable", () => {
    expect(resolveLineItemRevenue({ ...validLine, unit: "", total: "" }, 3)).toBe(0);
  });
});

describe("isValidLineItem", () => {
  it("rejects a blank SKU", () => {
    expect(isValidLineItem({ ...validLine, sku: "  " })).toBe(false);
  });

  it("accepts a well-formed line", () => {
    expect(isValidLineItem(validLine)).toBe(true);
  });
});
