/**
 * サービス層でのエラーハンドリングユーティリティ
 * 統一されたエラーハンドリングとログ記録を提供
 */

import {
	AppError,
	DatabaseError,
	ExternalServiceError,
	NotFoundError,
	TimeoutError,
	ValidationError,
	toAppError,
} from "../../utils/errors.js";

/**
 * サービス操作を実行し、エラーを適切に処理する
 * @param operation 操作の説明（ログ用）
 * @param fn 実行するサービス操作
 * @returns 操作の結果
 * @throws AppError エラーが発生した場合（元のエラー型を保持）
 */
export async function handleServiceOperation<T>(
	operation: string,
	fn: () => Promise<T>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		// 既にAppErrorの場合はそのまま再スロー（エラー型を保持）
		if (
			error instanceof AppError ||
			error instanceof DatabaseError ||
			error instanceof NotFoundError ||
			error instanceof ValidationError ||
			error instanceof ExternalServiceError ||
			error instanceof TimeoutError
		) {
			console.error(`Service operation failed: ${operation}`, {
				operation,
				error: error.message,
				code: error.code,
				details: error.details,
				stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
			});
			throw error;
		}

		const appError = toAppError(error);

		// エラーの種類に応じて適切なエラー型に変換
		if (appError instanceof DatabaseError || appError.code === "DATABASE_ERROR") {
			console.error(`Service operation failed (database error): ${operation}`, {
				operation,
				error: appError.message,
				code: appError.code,
				details: appError.details,
				stack: process.env.NODE_ENV !== "production" ? appError.stack : undefined,
			});
			throw appError;
		}

		// タイムアウトエラーの検出
		if (
			appError.message.includes("timeout") ||
			appError.message.includes("タイムアウト") ||
			appError.message.includes("ETIMEDOUT") ||
			appError.message.includes("AbortError")
		) {
			const timeoutError = new TimeoutError(
				`Service operation timeout: ${operation}`,
			);
			console.error(`Service operation timeout: ${operation}`, {
				operation,
				error: timeoutError.message,
				code: timeoutError.code,
				stack: process.env.NODE_ENV !== "production" ? timeoutError.stack : undefined,
			});
			throw timeoutError;
		}

		// 外部サービスエラーの検出（HTTPエラーなど）
		if (
			appError.message.includes("HTTP error") ||
			appError.message.includes("fetch failed") ||
			appError.message.includes("network")
		) {
			const externalError = new ExternalServiceError(
				"external",
				appError.message,
				appError.details,
			);
			console.error(`Service operation failed (external service error): ${operation}`, {
				operation,
				error: externalError.message,
				code: externalError.code,
				details: externalError.details,
				stack: process.env.NODE_ENV !== "production" ? externalError.stack : undefined,
			});
			throw externalError;
		}

		// その他のエラーもAppErrorとしてラップ
		console.error(`Unexpected error in service operation: ${operation}`, {
			operation,
			error: appError.message,
			code: appError.code,
			details: appError.details,
			stack: process.env.NODE_ENV !== "production" ? appError.stack : undefined,
		});
		throw appError;
	}
}

/**
 * サービス操作を実行し、エラーを適切に処理する（結果がnullの可能性がある場合）
 * @param operation 操作の説明（ログ用）
 * @param fn 実行するサービス操作
 * @returns 操作の結果（nullの可能性あり）
 * @throws AppError エラーが発生した場合
 */
export async function handleServiceOperationNullable<T>(
	operation: string,
	fn: () => Promise<T | null>,
): Promise<T | null> {
	return handleServiceOperation(operation, fn);
}

