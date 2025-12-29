import type { LLMConfig } from "@locus/shared";
import { getDb } from "./db.js";
import { assertLLMConfig, assertString } from "./utils/validators.js";

/**
 * 設定を取得する
 */
export async function getSetting(key: string): Promise<string | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT value FROM settings WHERE key = ?",
    args: [key],
  });

	if (result.rows.length === 0) {
		return null;
	}

	return assertString(result.rows[0].value, "value");
}

/**
 * 設定を保存する
 */
export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: `INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
    args: [key, value, now, value, now],
  });
}

/**
 * LLM設定を取得する
 */
export async function getLLMConfig(): Promise<LLMConfig | null> {
  const configJson = await getSetting("llm_config");
  if (!configJson) {
    return null;
  }
	try {
		const parsed = JSON.parse(configJson);
		return assertLLMConfig(parsed);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return null;
		}
		// ValidationErrorの場合は再スロー
		throw error;
	}
}
}

/**
 * LLM設定を保存する
 */
export async function setLLMConfig(config: LLMConfig): Promise<void> {
  await setSetting("llm_config", JSON.stringify(config));
}

/**
 * 設定を削除する
 */
export async function deleteSetting(key: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM settings WHERE key = ?",
    args: [key],
  });
}
