import Anthropic from "@anthropic-ai/sdk";
import { claude as claudeConfig } from "./config";

export function getAiModel(): string {
  return claudeConfig.model();
}

/** @deprecated Use getAiModel() */
export const AI_MODEL = "claude-sonnet-4-6";

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * claudeConfig.inputCostPerMillion() / 1_000_000) +
         (outputTokens * claudeConfig.outputCostPerMillion() / 1_000_000);
}

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export async function claudeComplete(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024,
): Promise<{
  content: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
}> {
  const start = Date.now();
  const c = getClient();
  const resp = await c.messages.create({
    model: getAiModel(),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const durationMs    = Date.now() - start;
  const inputTokens   = resp.usage.input_tokens;
  const outputTokens  = resp.usage.output_tokens;
  const content       = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  return { content, inputTokens, outputTokens, costUsd: estimateCost(inputTokens, outputTokens), durationMs };
}

export function isApiKeyConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
