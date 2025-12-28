import type { LLMConfig, LLMRequest, LLMResponse } from "@locus/shared";
import { BaseLLMProvider } from "./base.js";

/**
 * OpenAI互換APIプロバイダー（LM Studio、LocalAIなど）
 * baseUrlが必須で、APIキーは通常不要
 */
export class OpenAICompatibleProvider extends BaseLLMProvider {
  readonly name = "openai-compatible";

  private get baseUrl(): string {
    if (!this.config.baseUrl) {
      throw new Error("baseUrl is required for OpenAI compatible API");
    }
    return this.config.baseUrl;
  }

  constructor(config: LLMConfig) {
    super(config);
    if (!config.baseUrl) {
      throw new Error("baseUrl is required for OpenAI compatible API");
    }
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
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
      };
      // OpenAI互換APIでは通常APIキーは不要だが、設定されている場合は送信
      if (this.config.apiKey) {
        headers.Authorization = `Bearer ${this.config.apiKey}`;
      }

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        },
        300000 // 300秒（5分）のタイムアウト（ローカルLLMやタグ生成など時間がかかる処理に対応）
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `OpenAI compatible API error: ${response.status} ${error.error?.message ?? error.error ?? "Unknown error"}`
        );
      }

      // JSONのパースを安全に処理
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn("Failed to parse JSON response from OpenAI compatible API");
        return {
          text: "",
          model: this.config.model,
        };
      }

      // データ構造の検証
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.warn("OpenAI compatible API returned invalid response structure");
        return {
          text: "",
          tokensUsed: data?.usage?.total_tokens,
          model: this.config.model,
        };
      }

      const text = data.choices[0]?.message?.content;
      if (!text || text.trim().length === 0) {
        // 空のレスポンスの場合は、空文字列を返す（エラーではなく）
        // 呼び出し側で適切に処理できるようにする
        console.warn("OpenAI compatible API returned empty response");
        return {
          text: "",
          tokensUsed: data.usage?.total_tokens,
          model: this.config.model,
        };
      }

      return {
        text,
        tokensUsed: data.usage?.total_tokens,
        model: this.config.model,
      };
    } catch (error) {
      // 空のレスポンスや無効なレスポンスの場合は、エラーとして扱わずに空文字列を返す
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        // より広範囲にエラーメッセージをチェック（handleErrorが付加するプレフィックスも考慮）
        if (
          errorMessage.includes("empty response") ||
          errorMessage.includes("invalid response") ||
          errorMessage.includes("returned empty") ||
          errorMessage.includes("openai compatible api returned empty")
        ) {
          console.warn(`LLM API returned empty/invalid response: ${error.message}`);
          return {
            text: "",
            model: this.config.model,
          };
        }
      }
      // その他のエラーはhandleErrorで処理
      return this.handleError(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      // APIキーが設定されている場合は送信
      if (this.config.apiKey) {
        headers.Authorization = `Bearer ${this.config.apiKey}`;
      }
      // 簡単なリクエストで接続確認
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
