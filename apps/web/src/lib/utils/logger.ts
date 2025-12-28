/**
 * ロガーユーティリティ
 *
 * エラーログの記録と管理を行います。
 * 開発環境と本番環境で異なるログレベルを適用します。
 */

import { dev } from "$app/environment";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  /**
   * ログを記録する
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // 本番環境ではdebugログを記録しない
    if (!dev && level === "debug") {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    switch (level) {
      case "error":
        console.error(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
        break;
      case "warn":
        console.warn(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
        break;
      default:
        console.log(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
    }

    // 本番環境では、エラーログを外部サービスに送信する可能性がある
    // TODO: エラートラッキングサービスへの送信（Sentry等）
    if (!dev && level === "error") {
      // 将来的にエラートラッキングサービスに送信
    }
  }

  /**
   * デバッグログを記録する
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * 情報ログを記録する
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * 警告ログを記録する
   */
  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * エラーログを記録する
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };
    this.log("error", errorMessage, errorContext);
  }
}

export const logger = new Logger();

/**
 * エラーをログに記録する
 * @param error エラーオブジェクト
 * @param context 追加のコンテキスト情報
 */
export function logError(error: unknown, context?: LogContext): void {
  logger.error("Error occurred", error, context);
}
