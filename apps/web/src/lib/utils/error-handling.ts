/**
 * エラーハンドリングユーティリティ
 */

/**
 * APIエラーを処理し、ユーザーフレンドリーなメッセージを返す
 * @param error エラーオブジェクト（Error、unknown、またはstring）
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns エラーメッセージ文字列
 */
export function handleApiError(error: unknown, defaultMessage = "エラーが発生しました"): string {
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}

/**
 * エラーメッセージを取得（簡易版）
 * @param error エラーオブジェクト
 * @returns エラーメッセージ文字列
 */
export function getErrorMessage(error: unknown): string {
  return handleApiError(error);
}

/**
 * エラーの種類を判定
 */
export type ErrorType = "api" | "network" | "validation" | "unknown";

/**
 * エラーの種類を判定する
 * @param error エラーオブジェクト
 * @returns エラーの種類
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch")) {
      return "network";
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return "validation";
    }
    if (message.includes("api") || message.includes("http")) {
      return "api";
    }
  }
  return "unknown";
}
