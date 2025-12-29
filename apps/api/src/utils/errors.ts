/**
 * カスタムエラー型の定義
 * エラーの種類に応じた適切なHTTPステータスコードのマッピング
 */

/**
 * ベースエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    super(message, 404, "NOT_FOUND", { resource, id });
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

/**
 * 権限エラー
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends AppError {
  constructor(message: string = "Request timeout", timeoutMs?: number) {
    super(message, 504, "TIMEOUT_ERROR", { timeoutMs });
  }
}

/**
 * 外部サービスエラー（LLM APIなど）
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(`External service error (${service}): ${message}`, 502, "EXTERNAL_SERVICE_ERROR", {
      service,
      details,
    });
  }
}

/**
 * エラーをAppErrorに変換
 * @param error エラーオブジェクト
 * @returns AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // データベースエラーの検出
    if (
      error.message.includes("SQLITE_ERROR") ||
      error.message.includes("DATABASE_ERROR") ||
      error.message.includes("no such table") ||
      error.message.includes("no such column")
    ) {
      return new DatabaseError(error.message, { originalError: error.message });
    }

    // タイムアウトエラーの検出
    if (
      error.message.includes("timeout") ||
      error.message.includes("タイムアウト") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return new TimeoutError(error.message);
    }

    // その他のエラー
    return new AppError(error.message, 500, "INTERNAL_ERROR", {
      originalError: error.message,
      stack: error.stack,
    });
  }

  return new AppError("Unknown error occurred", 500, "UNKNOWN_ERROR", { error });
}

/**
 * エラーからHTTPステータスコードを取得
 * @param error エラーオブジェクト
 * @returns HTTPステータスコード
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * エラーからエラーコードを取得
 * @param error エラーオブジェクト
 * @returns エラーコード
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError && error.code) {
    return error.code;
  }
  return "INTERNAL_ERROR";
}

/**
 * エラーレスポンスの形式
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  stack?: string; // 開発環境のみ
}

/**
 * エラーをレスポンス形式に変換
 * @param error エラーオブジェクト
 * @param includeStack スタックトレースを含めるか（開発環境のみ）
 * @returns エラーレスポンス
 */
export function toErrorResponse(error: unknown, includeStack = false): ErrorResponse {
  const appError = toAppError(error);
  const response: ErrorResponse = {
    error: appError.message,
    code: appError.code,
  };

  if (appError.details) {
    response.details = appError.details;
  }

  if (includeStack && appError.stack) {
    response.stack = appError.stack;
  }

  return response;
}

