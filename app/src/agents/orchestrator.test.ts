import { describe, it, expect } from "vitest";
import { classifyAgents, toolsForAgents } from "@/agents/orchestrator";

describe("classifyAgents", () => {
  it("routes a sales question to the sales agent only", () => {
    expect(classifyAgents("Gimana omzet penjualan hari kemarin?")).not.toContain("inventory");
    expect(classifyAgents("Berapa transaksi minggu ini?")).toEqual(["sales"]);
  });

  it("routes an inventory question to the inventory agent only", () => {
    expect(classifyAgents("Produk apa yang harus saya restock?")).toEqual(["inventory"]);
  });

  it("routes a product question to the product agent only", () => {
    expect(classifyAgents("Produk mana yang performanya bagus?")).toEqual(["product"]);
  });

  it("routes cross-domain questions to multiple agents", () => {
    const agents = classifyAgents("Penjualan turun, produk apa yang harus saya beli?");
    expect(agents).toContain("sales");
    expect(agents).toContain("inventory");
  });

  it("falls back to all agents for broad daily-action questions", () => {
    expect(classifyAgents("Apa yang harus saya lakukan hari ini?")).toEqual(["sales", "inventory", "product"]);
  });

  it("falls back to all agents when no domain keyword matches", () => {
    expect(classifyAgents("Halo Smesh, apa kabar?")).toEqual(["sales", "inventory", "product"]);
  });

  // Regression: a real OpenAI end-to-end test showed this routing to all 3
  // agents instead of Sales only, because "hari ini" was a standalone broad
  // trigger that overrode an already-specific "penjualan" match.
  it("does not let a generic 'hari ini' override a specific domain match", () => {
    expect(classifyAgents("Gimana status penjualan hari ini?")).toEqual(["sales"]);
  });
});

describe("toolsForAgents", () => {
  it("returns a deduplicated union of tools across agents", () => {
    const tools = toolsForAgents(["sales", "inventory", "product"]);
    expect(new Set(tools).size).toBe(tools.length);
    expect(tools).toContain("get_today_sales");
    expect(tools).toContain("get_inventory_alerts");
  });
});
