/**
 * エラーメッセージマッピング
 *
 * エラーの種類に応じたユーザーフレンドリーなメッセージを提供します。
 */

import type { ErrorType } from "./error-handling";

export interface ErrorMessageMap {
	[key: string]: string;
}

const errorMessages: Record<ErrorType, ErrorMessageMap> = {
	network: {
		default: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
		timeout: "リクエストがタイムアウトしました。しばらくしてから再度お試しください。",
		offline: "オフラインです。インターネット接続を確認してください。",
		fetch: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
	},
	api: {
		default: "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
		notFound: "リソースが見つかりませんでした。",
		unauthorized: "認証が必要です。ログインしてください。",
		forbidden: "この操作を実行する権限がありません。",
		badRequest: "リクエストが不正です。入力内容を確認してください。",
		internalServerError: "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
	},
	validation: {
		default: "入力内容に誤りがあります。確認してください。",
		required: "必須項目が入力されていません。",
		invalid: "無効な値が入力されています。",
	},
	unknown: {
		default: "予期しないエラーが発生しました。",
	},
};

/**
 * エラーメッセージを取得する
 * @param error エラーオブジェクト
 * @param errorType エラーの種類
 * @returns エラーメッセージ文字列
 */
export function getErrorMessage(error: unknown, errorType: ErrorType): string {
	if (error instanceof Error) {
		const messageMap = errorMessages[errorType];
		// エラーメッセージに基づいてマッピングを検索
		const messageKey = error.message.toLowerCase();
		for (const [key, value] of Object.entries(messageMap)) {
			if (key !== "default" && messageKey.includes(key)) {
				return value;
			}
		}
		// デフォルトメッセージを返す
		return messageMap.default;
	}
	return errorMessages[errorType].default;
}

