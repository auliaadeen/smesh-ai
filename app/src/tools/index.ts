import type OpenAI from "openai";
import type { BusinessRepository } from "@/repositories/business-repository";

// Business tools — thin, independently-testable wrappers around
// BusinessRepository. They return structured facts only; the LLM never
// computes these numbers itself (spec Bab 13-14).

export const TOOL_NAMES = [
  "get_today_sales",
  "get_sales_comparison",
  "get_best_sellers",
  "get_inventory_alerts",
  "get_product_performance",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_today_sales",
      description: "Ambil data penjualan hari ini: omzet, jumlah transaksi, unit terjual.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sales_comparison",
      description: "Bandingkan omzet hari ini dengan periode pembanding, hasilkan persentase pertumbuhan.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_best_sellers",
      description: "Ambil daftar produk paling laku (unit terjual) dalam 7 hari terakhir.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Jumlah produk teratas, default 5" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_inventory_alerts",
      description:
        "Ambil produk yang stoknya di bawah atau sama dengan minimum stock, lengkap dengan sales velocity, rekomendasi jumlah reorder, dan urgency.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_performance",
      description:
        "Ambil performa produk (omzet, unit terjual, pertumbuhan, kontribusi terhadap total omzet) 7 hari terakhir.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "ID produk spesifik (opsional, kosongkan untuk semua produk)" },
        },
        additionalProperties: false,
      },
    },
  },
];

function isToolName(name: string): name is ToolName {
  return (TOOL_NAMES as readonly string[]).includes(name);
}

/** Validates the tool name and dispatches to the repository. Throws on invalid input. */
export async function executeTool(
  name: string,
  rawArgs: string,
  repository: BusinessRepository
): Promise<unknown> {
  if (!isToolName(name)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  let args: Record<string, unknown> = {};
  if (rawArgs) {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      throw new Error(`Invalid tool arguments for ${name}: ${rawArgs}`);
    }
  }

  switch (name) {
    case "get_today_sales":
      return repository.getTodaySales();
    case "get_sales_comparison":
      return repository.getSalesComparison();
    case "get_best_sellers": {
      const limit = typeof args.limit === "number" ? args.limit : undefined;
      return repository.getBestSellers(limit);
    }
    case "get_inventory_alerts":
      return repository.getInventoryAlerts();
    case "get_product_performance": {
      const productId = typeof args.productId === "string" ? args.productId : undefined;
      return repository.getProductPerformance(productId);
    }
  }
}
