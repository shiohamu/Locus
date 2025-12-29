/**
 * データベース層でのエラーハンドリングユーティリティ
 * 統一されたエラーハンドリングとログ記録を提供
 */

import {
	DatabaseError,
	NotFoundError,
	ValidationError,
	toAppError,
} from "../../utils/errors.js";

/**
 * データベース操作を実行し、エラーを適切に処理する
 * @param operation 操作の説明（ログ用）
 * @param fn 実行するデータベース操作
 * @returns 操作の結果
 * @throws AppError エラーが発生した場合（元のエラー型を保持）
 */
export async function handleDbOperation<T>(
	operation: string,
	fn: () => Promise<T>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		// 既にAppErrorの場合はそのまま再スロー（エラー型を保持）
		if (error instanceof DatabaseError || error instanceof NotFoundError || error instanceof ValidationError) {
			console.error(`Database operation failed: ${operation}`, {
				operation,
				error: error.message,
				code: error.code,
				details: error.details,
				stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
			});
			throw error;
		}

		const appError = toAppError(error);

		// データベースエラーの場合は詳細を記録
		if (appError instanceof DatabaseError || appError.code === "DATABASE_ERROR") {
			console.error(`Database operation failed: ${operation}`, {
				operation,
				error: appError.message,
				code: appError.code,
				details: appError.details,
				stack: process.env.NODE_ENV !== "production" ? appError.stack : undefined,
			});
			throw appError;
		}

		// その他のエラーもDatabaseErrorとしてラップ
		console.error(`Unexpected error in database operation: ${operation}`, {
			operation,
			error: appError.message,
			code: appError.code,
			details: appError.details,
			stack: process.env.NODE_ENV !== "production" ? appError.stack : undefined,
		});
		throw new DatabaseError(
			`Database operation failed: ${operation}`,
			{ originalError: appError.message, details: appError.details },
		);
	}
}

/**
 * データベース操作を実行し、エラーを適切に処理する（結果がnullの可能性がある場合）
 * @param operation 操作の説明（ログ用）
 * @param fn 実行するデータベース操作
 * @returns 操作の結果（nullの可能性あり）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function handleDbOperationNullable<T>(
	operation: string,
	fn: () => Promise<T | null>,
): Promise<T | null> {
	return handleDbOperation(operation, fn);
}

