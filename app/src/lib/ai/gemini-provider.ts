import type { AIProvider, ToolCompletionParams, ToolCompletionResult } from "@/lib/ai/provider";

// Batch 2 P2 — interface reserved so Business Partner never has to change
// when this gets a real implementation. Not wired to @google/generative-ai
// yet: adding that dependency before it's actually used would violate the
// "no unnecessary dependencies" rule.
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  async createToolCompletion(params: ToolCompletionParams): Promise<ToolCompletionResult> {
    void params;
    throw new Error("Gemini provider belum diimplementasikan — set AI_PROVIDER=openai atau kosongkan.");
  }
}
