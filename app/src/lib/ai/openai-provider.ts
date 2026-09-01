import OpenAI from "openai";
import type { AIProvider, ToolCompletionParams, ToolCompletionResult } from "@/lib/ai/provider";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async createToolCompletion({ model, messages, tools, temperature }: ToolCompletionParams): Promise<ToolCompletionResult> {
    const completion = await this.client.chat.completions.create({ model, messages, tools, temperature });
    const message = completion.choices[0]?.message;
    if (!message) throw new Error("Respons OpenAI kosong");
    return { message };
  }
}
