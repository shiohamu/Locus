import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import { cleanupTestDbFile, createTestDbFile } from "../test/helpers.js";

describe("settings API", () => {
  let testDb: Client;
  let dbPath: string;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    const result = await createTestDbFile();
    testDb = result.db;
    dbPath = result.path;

    originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${dbPath}`;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      process.env.DATABASE_URL = undefined;
    }

    await cleanupTestDbFile(testDb, dbPath);
  });

  test("GET /settings/llm - LLM設定が存在しない場合は404を返す", async () => {
    const res = await app.request("/settings/llm");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("LLM config not found");
  });

  test("PUT /settings/llm - LLM設定を保存できる（OpenAI）", async () => {
    const config = {
      provider: "openai",
      model: "gpt-4",
      apiKey: "test-api-key",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("設定を保存しました");
  });

  test("GET /settings/llm - 保存したLLM設定を取得できる（APIキーは非表示）", async () => {
    const config = {
      provider: "openai",
      model: "gpt-4",
      apiKey: "test-api-key",
    };

    // 設定を保存
    await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    // 設定を取得
    const res = await app.request("/settings/llm");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.provider).toBe("openai");
    expect(body.model).toBe("gpt-4");
    expect(body.apiKey).toBe(true); // APIキーは存在を示すboolean
  });

  test("PUT /settings/llm - OpenAI互換APIの設定を保存できる", async () => {
    const config = {
      provider: "openai-compatible",
      model: "llama3",
      baseUrl: "http://localhost:1234/v1",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("設定を保存しました");
  });

  test("PUT /settings/llm - Ollamaの設定を保存できる", async () => {
    const config = {
      provider: "ollama",
      model: "llama3",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("設定を保存しました");
  });

  test("PUT /settings/llm - 無効なプロバイダーは400を返す", async () => {
    const config = {
      provider: "invalid-provider",
      model: "gpt-4",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("無効なプロバイダーです");
  });

  test("PUT /settings/llm - OpenAIでAPIキーがない場合は400を返す", async () => {
    const config = {
      provider: "openai",
      model: "gpt-4",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("OpenAI APIキーは必須です");
  });

  test("PUT /settings/llm - OpenAI互換APIでbaseUrlがない場合は400を返す", async () => {
    const config = {
      provider: "openai-compatible",
      model: "llama3",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("ベースURLは必須です（例: http://localhost:1234/v1）");
  });

  test("PUT /settings/llm - providerが必須", async () => {
    const config = {
      model: "gpt-4",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("Missing required field: provider");
  });

  test("PUT /settings/llm - modelが必須", async () => {
    const config = {
      provider: "openai",
    };

    const res = await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("Missing required field: model");
  });

  test("DELETE /settings/llm - LLM設定を削除できる", async () => {
    // 設定を保存
    const config = {
      provider: "openai",
      model: "gpt-4",
      apiKey: "test-api-key",
    };

    await app.request("/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    // 設定を削除
    const res = await app.request("/settings/llm", {
      method: "DELETE",
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("設定を削除しました");

    // 削除後は404を返す
    const getRes = await app.request("/settings/llm");
    expect(getRes.status).toBe(404);
  });
});
