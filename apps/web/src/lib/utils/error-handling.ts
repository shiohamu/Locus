/**
 * エラーハンドリングユーティリティ
 */

import { getErrorMessage as getErrorMessageFromMap } from "./error-messages";
import { logError } from "./logger";

/**
 * APIエラーを処理し、ユーザーフレンドリーなメッセージを返す
 * @param error エラーオブジェクト（Error、unknown、またはstring）
 * @param defaultMessage デフォルトのエラーメッセージ（エラーメッセージマッピングが使用できない場合）
 * @returns エラーメッセージ文字列
 */
export function handleApiError(error: unknown, defaultMessage?: string): string {
  // エラーの種類を判定
  const errorType = getErrorType(error);

  // エラーメッセージマッピングからメッセージを取得
  const message = getErrorMessageFromMap(error, errorType);

  // エラーログを記録
  logError(error, { errorType, message });

  // デフォルトメッセージが指定されている場合は、それを使用（後方互換性のため）
  if (defaultMessage && message === "予期しないエラーが発生しました。") {
    return defaultMessage;
  }

  return message;
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
