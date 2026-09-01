import type { ToolName } from "@/tools";
import { salesAgent } from "@/agents/sales-agent";
import { inventoryAgent } from "@/agents/inventory-agent";
import { productAgent } from "@/agents/product-agent";

export type AgentKey = "sales" | "inventory" | "product";

export const AGENT_REGISTRY: Record<AgentKey, { name: string; description: string; tools: ToolName[] }> = {
  sales: salesAgent,
  inventory: inventoryAgent,
  product: productAgent,
};

// Deterministic keyword routing (spec Bab 19). Kept simple on purpose —
// model-based routing would cost an extra LLM round-trip for something a
// keyword match already resolves reliably in Bahasa Indonesia.
const DOMAIN_KEYWORDS: Record<AgentKey, string[]> = {
  sales: ["omzet", "penjualan", "sales", "jual", "transaksi", "laris", "growth", "pertumbuhan"],
  inventory: ["stok", "stock", "restock", "reorder", "beli", "habis", "kritis", "inventory"],
  // Deliberately no bare "produk" — it also shows up in inventory questions
  // like "produk apa yang perlu restock" (spec Bab 19 maps that to Inventory,
  // not Product), so product routing needs a more specific phrase.
  product: ["performa", "kontribusi", "produk mana", "produk paling", "underperform", "best seller"],
};

/**
 * Classifies which agent(s) a question needs. A domain-specific match always
 * wins and scopes to just that domain — even when the question also mentions
 * something generic like "hari ini" (present in almost every question a UMKM
 * owner asks, so treating it as a standalone broad trigger defeated routing
 * entirely; caught via a real end-to-end OpenAI test where "Gimana status
 * penjualan hari ini?" was routing to all 3 agents instead of Sales only).
 * Only falls back to all agents when NO domain keyword matches at all —
 * genuinely broad questions like "apa yang harus saya lakukan hari ini?" hit
 * this path naturally, since they don't contain any domain-specific keyword.
 */
export function classifyAgents(question: string): AgentKey[] {
  const q = question.toLowerCase();
  const matched = (Object.keys(DOMAIN_KEYWORDS) as AgentKey[]).filter((agent) =>
    DOMAIN_KEYWORDS[agent].some((kw) => q.includes(kw))
  );

  return matched.length > 0 ? matched : ["sales", "inventory", "product"];
}

export function toolsForAgents(agents: AgentKey[]): ToolName[] {
  return [...new Set(agents.flatMap((a) => AGENT_REGISTRY[a].tools))];
}

export function agentNames(agents: AgentKey[]): string[] {
  return agents.map((a) => AGENT_REGISTRY[a].name);
}
