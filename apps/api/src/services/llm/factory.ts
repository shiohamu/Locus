import type { LLMConfig, LLMProviderInterface } from "@locus/shared";
import * as settingsDb from "../../db/settings.js";
import { OllamaProvider } from "./ollama.js";
import { OpenAICompatibleProvider } from "./openai-compatible.js";
import { OpenAIProvider } from "./openai.js";

/**
 * LLMプロバイダーファクトリー
 */
export function createLLMProvider(config: LLMConfig): LLMProviderInterface {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config);
    case "openai-compatible":
      return new OpenAICompatibleProvider(config);
    case "ollama":
      return new OllamaProvider(config);
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}

/**
 * 環境変数からLLM設定を取得
 */
export function getLLMConfigFromEnv(): LLMConfig | null {
  const provider = (process.env.LLM_PROVIDER as "openai" | "ollama" | undefined) ?? "ollama";
  const model = process.env.LLM_MODEL ?? (provider === "ollama" ? "llama3" : "gpt-3.5-turbo");
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OLLAMA_BASE_URL;

  if (provider === "openai" && !apiKey) {
    return null;
  }

  return {
    provider,
    apiKey,
    baseUrl,
    model,
    maxTokens: process.env.LLM_MAX_TOKENS ? Number.parseInt(process.env.LLM_MAX_TOKENS, 10) : 1000,
    temperature: process.env.LLM_TEMPERATURE ? Number.parseFloat(process.env.LLM_TEMPERATURE) : 0.7,
  };
}

/**
 * データベースまたは環境変数からLLM設定を取得
 */
export async function getLLMConfig(): Promise<LLMConfig | null> {
  // まずデータベースから取得を試みる
  const dbConfig = await settingsDb.getLLMConfig();
  if (dbConfig) {
    return dbConfig;
  }

  // データベースにない場合は環境変数から取得
  return getLLMConfigFromEnv();
}
