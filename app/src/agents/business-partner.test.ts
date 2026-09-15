import { describe, it, expect } from "vitest";
import type OpenAI from "openai";
import { runBusinessPartner } from "@/agents/business-partner";
import { mockBusinessRepository } from "@/repositories/mock-business-repository";
import type { AIProvider, ToolCompletionParams, ToolCompletionResult } from "@/lib/ai";

type Msg = OpenAI.Chat.Completions.ChatCompletionMessage;

function finalMessage(content: string): Msg {
  return { role: "assistant", content, refusal: null };
}

function toolCallMessage(name: string, args: Record<string, unknown>): Msg {
  return {
    role: "assistant",
    content: null,
    refusal: null,
    tool_calls: [
      { id: `call_${name}`, type: "function", function: { name, arguments: JSON.stringify(args) } },
    ],
  };
}

/** Scripted stand-in for the OpenAI provider — lets these tests assert on
 * what Business Partner actually executed (trace, scoped tools) without a
 * real network call, and records every request it received. */
class QueueProvider implements AIProvider {
  readonly name = "fake";
  calls: ToolCompletionParams[] = [];
  constructor(private queue: Msg[]) {}
  async createToolCompletion(params: ToolCompletionParams): Promise<ToolCompletionResult> {
    this.calls.push(params);
    const message = this.queue.shift();
    if (!message) throw new Error("QueueProvider ran out of scripted responses");
    return { message };
  }
}

function toolNamesOf(params: ToolCompletionParams): string[] {
  return params.tools.map((t) => (t.type === "function" ? t.function.name : t.type));
}

describe("runBusinessPartner", () => {
  // Batch 2.1 TEST C — a broad business-condition question must actually
  // execute Sales, Inventory AND Product tools, deterministically, no
  // matter what the model decides to do.
  it("pre-fetches sales, inventory and product tools for a broad question", async () => {
    const provider = new QueueProvider([finalMessage("Ringkasan bisnis hari ini.")]);
    const result = await runBusinessPartner(
      "Bagaimana kondisi bisnis dan apa yang harus saya lakukan hari ini?",
      [],
      mockBusinessRepository,
      provider
    );

    expect(result.trace).toContain("get_today_sales");
    expect(result.trace).toContain("get_sales_comparison");
    expect(result.trace).toContain("get_best_sellers");
    expect(result.trace).toContain("get_inventory_alerts");
    expect(result.trace).toContain("get_product_performance");
    expect(result.agentsUsed).toEqual(["Sales Agent", "Inventory Agent", "Product Agent"]);
  });

  // Batch 2.1 TEST B — a fictional product must short-circuit to an
  // explicit not-found answer and never fall through to a real product.
  it("reports a fictional product as not found without substituting another product", async () => {
    const provider = new QueueProvider([toolCallMessage("get_product_status", { query: "SMESH-XYZ" })]);
    const result = await runBusinessPartner("Bagaimana stok produk SMESH-XYZ?", [], mockBusinessRepository, provider);

    expect(result.answer).toMatch(/tidak ditemukan/i);
    expect(result.answer).not.toMatch(/Kopi Arabica|Robusta|Madu Hutan|Gula Aren/i);
    expect(result.trace).toEqual(["get_product_status"]);
  });

  // Batch 2.1 TEST A — a real, named product is scoped to the exact lookup
  // tool only; the model has no access to any aggregate tool that could
  // pull in an unrelated product for this question.
  it("scopes a specific product question to get_product_status only", async () => {
    const provider = new QueueProvider([
      toolCallMessage("get_product_status", { query: "Kopi Arabica" }),
      finalMessage("Stok Kopi Arabica aman."),
    ]);
    const result = await runBusinessPartner("Bagaimana stok Kopi Arabica?", [], mockBusinessRepository, provider);

    expect(result.trace).toEqual(["get_product_status"]);
    expect(toolNamesOf(provider.calls[0])).toEqual(["get_product_status"]);
  });

  // Batch 2.1 TEST D — a sales-only question must not be handed
  // inventory/product tools.
  it("does not expose inventory tools to a sales-only question", async () => {
    const provider = new QueueProvider([finalMessage("Omzet hari ini segini.")]);
    const result = await runBusinessPartner("Cek penjualan hari ini", [], mockBusinessRepository, provider);

    expect(toolNamesOf(provider.calls[0])).not.toContain("get_inventory_alerts");
    expect(result.agentsUsed).toEqual(["Sales Agent"]);
  });

  // Batch 2.1 TEST E — an inventory-only question must expose (and actually
  // use) the inventory alert tool with real low-stock products.
  it("uses the inventory alert tool for a restock question", async () => {
    const provider = new QueueProvider([
      toolCallMessage("get_inventory_alerts", {}),
      finalMessage("Ini produk yang harus direstock."),
    ]);
    const result = await runBusinessPartner("Produk yang harus di-restock?", [], mockBusinessRepository, provider);

    expect(result.trace).toContain("get_inventory_alerts");
    expect(result.agentsUsed).toEqual(["Inventory Agent"]);
  });
});
