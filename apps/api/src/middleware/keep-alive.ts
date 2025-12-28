import type { Context, Next } from "hono";

/**
 * Keep-Aliveヘッダーを追加するミドルウェア
 * 長時間実行されるリクエスト（LLM処理など）で接続を維持するため
 */
export async function keepAliveMiddleware(c: Context, next: Next) {
  await next();
  // Keep-Aliveヘッダーを追加
  c.header("Connection", "keep-alive");
  c.header("Keep-Alive", "timeout=180");
}

