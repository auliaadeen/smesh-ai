import type { AIProvider } from "@/lib/ai/provider";
import { OpenAIProvider } from "@/lib/ai/openai-provider";
import { GeminiProvider } from "@/lib/ai/gemini-provider";

export type { AIProvider, ToolCompletionParams, ToolCompletionResult } from "@/lib/ai/provider";

/** AI_PROVIDER=openai (default) | gemini. Never exposes the key itself. */
export function getAIProvider(): AIProvider {
  const selected = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (selected === "gemini") {
    console.log("[ai] provider=gemini");
    return new GeminiProvider();
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY belum diset");
  console.log("[ai] provider=openai");
  return new OpenAIProvider(apiKey);
}
