import type { LLMConfig, LLMRequest, LLMResponse } from "@locus/shared";
import { BaseLLMProvider } from "./base.js";

/**
 * OpenAI APIプロバイダー（公式OpenAI API専用）
 */
export class OpenAIProvider extends BaseLLMProvider {
  readonly name = "openai";

  private readonly baseUrl = "https://api.openai.com";

  constructor(config: LLMConfig) {
    super(config);
    if (!config.apiKey) {
      throw new Error("OpenAI API key is required");
    }
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error("OpenAI API key is not set");
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });

    const body = {
      model: this.config.model,
      messages,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? 1000,
      temperature: request.temperature ?? this.config.temperature ?? 0.7,
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        },
        180000 // 180秒（3分）のタイムアウト（タグ生成など時間がかかる処理に対応）
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `OpenAI API error: ${response.status} ${error.error?.message ?? error.error ?? "Unknown error"}`
        );
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;
      if (!text) {
        throw new Error("OpenAI API returned empty response");
      }

      return {
        text,
        tokensUsed: data.usage?.total_tokens,
        model: this.config.model,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }
    try {
      // 簡単なリクエストで接続確認
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
