import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * エラーハンドリングミドルウェア
 */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  // 詳細なエラー情報をログに出力
  console.error("Unhandled error:", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    name: err instanceof Error ? err.name : undefined,
    path: c.req.path,
    method: c.req.method,
    url: c.req.url,
  });

  // 開発環境では詳細なエラー情報を返す
  const isDevelopment = process.env.NODE_ENV !== "production";
  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  const errorDetails = isDevelopment
    ? {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        path: c.req.path,
        method: c.req.method,
      }
    : { error: "Internal Server Error" };

  return c.json(errorDetails, 500);
};
