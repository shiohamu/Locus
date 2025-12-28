import type { LLMConfig } from "@locus/shared";
import { Hono } from "hono";
import * as settingsDb from "../db/settings.js";

const app = new Hono();

/**
 * LLM設定取得
 * GET /settings/llm
 */
app.get("/llm", async (c) => {
  try {
    const config = await settingsDb.getLLMConfig();
    if (!config) {
      return c.json({ error: "LLM設定が見つかりません" }, 404);
    }

    // 機密情報を除外
    const safeConfig: Omit<LLMConfig, "apiKey"> & { apiKey?: boolean } = {
      ...config,
      apiKey: config.apiKey ? true : undefined,
    };

    return c.json(safeConfig);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * LLM設定保存
 * PUT /settings/llm
 */
app.put("/llm", async (c) => {
  try {
    const body = await c.req.json<LLMConfig>();

    // バリデーション
    const validProviders: Array<"openai" | "openai-compatible" | "ollama"> = [
      "openai",
      "openai-compatible",
      "ollama",
    ];
    if (!body.provider || !validProviders.includes(body.provider)) {
      return c.json(
        {
          error: `無効なプロバイダーです: ${body.provider}。有効なプロバイダー: ${validProviders.join(", ")}`,
        },
        400
      );
    }

    if (!body.model || typeof body.model !== "string") {
      return c.json({ error: "モデル名は必須です" }, 400);
    }

    // OpenAIプロバイダーの場合、APIキーが必須
    if (body.provider === "openai" && !body.apiKey) {
      return c.json({ error: "OpenAI APIキーは必須です" }, 400);
    }

    // OpenAI互換APIプロバイダーの場合、baseUrlが必須
    if (body.provider === "openai-compatible" && !body.baseUrl) {
      return c.json({ error: "ベースURLは必須です（例: http://localhost:1234/v1）" }, 400);
    }

    await settingsDb.setLLMConfig(body);
    return c.json({ message: "設定を保存しました" });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({ error: "リクエストボディのJSON形式が不正です" }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * LLM設定削除
 * DELETE /settings/llm
 */
app.delete("/llm", async (c) => {
  try {
    await settingsDb.deleteSetting("llm_config");
    return c.json({ message: "設定を削除しました" });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
