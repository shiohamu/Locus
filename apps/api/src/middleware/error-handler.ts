import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  getStatusCode,
  getErrorCode,
  toErrorResponse,
  toAppError,
  AppError,
} from "../utils/errors.js";

/**
 * エラーハンドリングミドルウェア
 */
export const errorHandler: ErrorHandler = (err, c) => {
  // HonoのHTTPExceptionの処理
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, code: "HTTP_EXCEPTION" }, err.status);
  }

  // AppErrorに変換
  const appError = toAppError(err);
  const statusCode = getStatusCode(appError);
  const isDevelopment = process.env.NODE_ENV !== "production";

  // エラーログの出力
  console.error("Error occurred:", {
    message: appError.message,
    code: getErrorCode(appError),
    statusCode,
    path: c.req.path,
    method: c.req.method,
    url: c.req.url,
    stack: isDevelopment ? appError.stack : undefined,
    details: appError instanceof AppError ? appError.details : undefined,
  });

  // エラーレスポンスの生成
  const errorResponse = toErrorResponse(appError, isDevelopment);

  return c.json(errorResponse, statusCode);
};
