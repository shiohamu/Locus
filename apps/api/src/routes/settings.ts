import type { LLMConfig } from "@locus/shared";
import { Hono } from "hono";
import * as settingsDb from "../db/settings.js";
import { getJsonBody, validateRequired, validateString } from "../middleware/validation.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const app = new Hono();

/**
 * LLM設定取得
 * GET /settings/llm
 * @returns {Promise<Omit<LLMConfig, 'apiKey'> & {apiKey?: boolean}>} LLM設定（APIキーは機密情報のため除外）
 * @throws {NotFoundError} LLM設定が見つからない場合
 */
app.get("/llm", async (c) => {
  const config = await settingsDb.getLLMConfig();
  if (!config) {
    throw new NotFoundError("LLM config");
  }

  // 機密情報を除外
  const safeConfig: Omit<LLMConfig, "apiKey"> & { apiKey?: boolean } = {
    ...config,
    apiKey: config.apiKey ? true : undefined,
  };

  return c.json(safeConfig);
});

/**
 * LLM設定保存
 * PUT /settings/llm
 * @param {LLMConfig} body - LLM設定
 * @returns {Promise<{message: string}>} 保存成功メッセージ
 * @throws {ValidationError} バリデーションエラー（プロバイダーが無効、必須項目が不足など）
 */
app.put("/llm", async (c) => {
  const body = await getJsonBody<LLMConfig>(c);
  validateRequired(body, ["provider", "model"]);
  validateString(body.provider, "provider");
  validateString(body.model, "model");

  // バリデーション
  const validProviders: Array<"openai" | "openai-compatible" | "ollama"> = [
    "openai",
    "openai-compatible",
    "ollama",
  ];
  if (!validProviders.includes(body.provider as (typeof validProviders)[number])) {
    throw new ValidationError(
      `無効なプロバイダーです: ${body.provider}。有効なプロバイダー: ${validProviders.join(", ")}`
    );
  }

  // OpenAIプロバイダーの場合、APIキーが必須
  if (body.provider === "openai" && !body.apiKey) {
    throw new ValidationError("OpenAI APIキーは必須です");
  }

  // OpenAI互換APIプロバイダーの場合、baseUrlが必須
  if (body.provider === "openai-compatible" && !body.baseUrl) {
    throw new ValidationError("ベースURLは必須です（例: http://localhost:1234/v1）");
  }

  await settingsDb.setLLMConfig(body);
  return c.json({ message: "設定を保存しました" });
});

/**
 * LLM設定削除
 * DELETE /settings/llm
 * @returns {Promise<{message: string}>} 削除成功メッセージ
 */
app.delete("/llm", async (c) => {
  await settingsDb.deleteSetting("llm_config");
  return c.json({ message: "設定を削除しました" });
});

export default app;
