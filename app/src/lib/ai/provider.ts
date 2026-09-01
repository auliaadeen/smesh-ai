import type OpenAI from "openai";

// Common currency both providers speak. Kept in OpenAI's shape for now since
// OpenAI is the only real implementation — Gemini's very different function-
// calling API gets translated to/from this shape once it's actually wired up.
export type ToolCompletionParams = {
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools: OpenAI.Chat.Completions.ChatCompletionTool[];
  temperature?: number;
};

export type ToolCompletionResult = {
  message: OpenAI.Chat.Completions.ChatCompletionMessage;
};

export interface AIProvider {
  readonly name: string;
  createToolCompletion(params: ToolCompletionParams): Promise<ToolCompletionResult>;
}
