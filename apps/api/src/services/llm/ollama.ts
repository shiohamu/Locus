import type { LLMConfig, LLMRequest, LLMResponse } from "@locus/shared";
import { BaseLLMProvider } from "./base.js";

/**
 * Ollama APIプロバイダー（ローカルLLM）
 */
export class OllamaProvider extends BaseLLMProvider {
  readonly name = "ollama";

  private get baseUrl(): string {
    return this.config.baseUrl ?? "http://localhost:11434";
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const prompt = this.buildPrompt(request);

    const body = {
      model: this.config.model,
      prompt,
      stream: false,
      options: {
        temperature: request.temperature ?? this.config.temperature ?? 0.7,
        num_predict: request.maxTokens ?? this.config.maxTokens ?? 1000,
      },
    };

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        120000 // 120秒のタイムアウト（ローカルLLMは時間がかかることがある）
      );

      if (!response.ok) {
        const error = await response.text().catch(() => "Unknown error");
        throw new Error(`Ollama API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      const text = data.response;
      if (!text) {
        throw new Error("Ollama API returned empty response");
      }

      return {
        text,
        model: this.config.model,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
