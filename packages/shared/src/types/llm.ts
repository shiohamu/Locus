/**
 * LLMプロバイダーの種類
 */
export type LLMProvider = "openai" | "openai-compatible" | "ollama";

/**
 * LLM設定
 */
export interface LLMConfig {
  /** プロバイダー */
  provider: LLMProvider;
  /** APIキー（OpenAIの場合必須、OpenAI互換APIの場合は通常不要） */
  apiKey?: string;
  /** ベースURL（OpenAI互換APIとOllamaで使用。Ollama: http://localhost:11434、LM Studio: http://localhost:1234/v1） */
  baseUrl?: string;
  /** モデル名 */
  model: string;
  /** 最大トークン数 */
  maxTokens?: number;
  /** 温度（0-2、デフォルト: 0.7） */
  temperature?: number;
}

/**
 * LLMリクエスト
 */
export interface LLMRequest {
  /** プロンプト */
  prompt: string;
  /** システムプロンプト（オプション） */
  systemPrompt?: string;
  /** 最大トークン数（オプション、設定を上書き） */
  maxTokens?: number;
  /** 温度（オプション、設定を上書き） */
  temperature?: number;
}

/**
 * LLMレスポンス
 */
export interface LLMResponse {
  /** 生成されたテキスト */
  text: string;
  /** 使用されたトークン数（利用可能な場合） */
  tokensUsed?: number;
  /** モデル名 */
  model: string;
}

/**
 * LLMプロバイダーインターフェース
 */
export interface LLMProviderInterface {
  /** プロバイダー名 */
  readonly name: string;
  /** 設定 */
  readonly config: LLMConfig;
  /** リクエストを送信 */
  generate(request: LLMRequest): Promise<LLMResponse>;
  /** プロバイダーが利用可能かどうか */
  isAvailable(): Promise<boolean>;
}
