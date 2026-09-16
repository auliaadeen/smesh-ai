import type OpenAI from "openai";
import type { BusinessRepository } from "@/repositories/business-repository";

// Business tools — thin, independently-testable wrappers around
// BusinessRepository. They return structured facts only; the LLM never
// computes these numbers itself (spec Bab 13-14).

export const TOOL_NAMES = [
  "get_today_sales",
  "get_today_product_sales",
  "get_sales_comparison",
  "get_best_sellers",
  "get_inventory_alerts",
  "get_product_performance",
  "get_product_status",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

// Plain-language, non-technical explanation of what each tool actually did —
// shown to UMKM owners in the AI trace UX (spec Phase 3 §10). Deliberately
// short and free of implementation detail (no payloads, no prompts).
export const TOOL_LABELS: Record<ToolName, string> = {
  get_today_sales: "Sales Agent membaca data penjualan hari ini.",
  get_today_product_sales: "Sales Agent merinci produk yang terjual hari ini.",
  get_sales_comparison: "Sales Agent membandingkan omzet dengan minggu lalu.",
  get_best_sellers: "Product Agent mengambil produk paling laku 7 hari terakhir.",
  get_inventory_alerts: "Inventory Agent memeriksa produk di bawah minimum stock.",
  get_product_performance: "Product Agent menganalisis performa produk.",
  get_product_status: "Inventory Agent mengecek status stok satu produk spesifik.",
};

export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_today_sales",
      description: "Ambil data penjualan HARI INI saja: omzet, jumlah transaksi, dan unit terjual. Gunakan untuk pertanyaan yang menyebut hari ini.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_today_product_sales",
      description: "Ambil rincian produk yang TERJUAL HARI INI saja, dikelompokkan per produk dan diurutkan dari unit terbanyak. Jumlah unit dan omzet dari tool ini harus konsisten dengan get_today_sales. Gunakan untuk pertanyaan seperti '75 unit hari ini dari produk apa saja' atau 'produk terlaris hari ini'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Jumlah produk teratas, default 10" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sales_comparison",
      description: "Bandingkan omzet hari ini dengan hari yang sama minggu lalu, hasilkan persentase pertumbuhan.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_best_sellers",
      description: "Ambil daftar produk paling laku berdasarkan AKUMULASI 7 HARI TERAKHIR. Jangan gunakan tool ini untuk menjawab 'hari ini' atau menghitung unit penjualan hari ini.",
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
  {
    type: "function",
    function: {
      name: "get_product_status",
      description:
        "Cari SATU produk spesifik berdasarkan nama atau ID persis seperti disebut user, lalu kembalikan identitas dan status stoknya. WAJIB dipakai setiap kali user menyebut nama/ID produk tertentu (termasuk yang terdengar tidak dikenal). Jika produk tidak ditemukan, hasil akan berisi found:false — dalam kasus itu JANGAN mengganti dengan produk lain atau tool lain.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Nama atau ID produk persis seperti disebut user" },
        },
        required: ["query"],
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
    case "get_today_product_sales": {
      const limit = typeof args.limit === "number" ? args.limit : undefined;
      return repository.getTodayProductSales(limit);
    }
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
    case "get_product_status": {
      const query = typeof args.query === "string" ? args.query : "";
      const status = await repository.getProductStatus(query);
      return status ? { found: true, ...status } : { found: false, query };
    }
  }
}
