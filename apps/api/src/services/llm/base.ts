import type { LLMConfig, LLMProviderInterface, LLMRequest, LLMResponse } from "@locus/shared";

/**
 * LLMプロバイダーのベースクラス
 */
export abstract class BaseLLMProvider implements LLMProviderInterface {
  abstract readonly name: string;
  readonly config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generate(request: LLMRequest): Promise<LLMResponse>;
  abstract isAvailable(): Promise<boolean>;

  /**
   * プロンプトを構築
   */
  protected buildPrompt(request: LLMRequest): string {
    if (request.systemPrompt) {
      return `${request.systemPrompt}\n\n${request.prompt}`;
    }
    return request.prompt;
  }

  /**
   * エラーハンドリング
   */
  protected handleError(error: unknown): never {
    if (error instanceof Error) {
      // タイムアウトや接続エラーの場合、より詳細なメッセージを返す
      if (error.message.includes("socket hang up") || error.message.includes("ECONNRESET")) {
        throw new Error(
          "LLM APIへの接続が切断されました。LLMサービスが起動しているか、ネットワーク接続を確認してください。"
        );
      }
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        throw new Error(
          "LLM APIへのリクエストがタイムアウトしました。コンテンツが長すぎる可能性があります。"
        );
      }
      throw new Error(`LLM request failed: ${error.message}`);
    }
    throw new Error("LLM request failed: Unknown error");
  }

  /**
   * fetchリクエストにタイムアウトを設定
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = 120000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }
}
