/**
 * API共通エラーレスポンス
 */
export interface APIError {
	/** エラーメッセージ */
	error: string;
	/** エラーコード（オプション） */
	code?: string;
}

/**
 * ページネーション用クエリパラメータ
 */
export interface PaginationQuery {
	/** 取得件数 */
	limit?: number;
	/** オフセット */
	offset?: number;
}

/**
 * ページネーション用レスポンス
 */
export interface PaginatedResponse<T> {
	/** データ配列 */
	items: T[];
	/** 総件数 */
	total: number;
	/** 現在のオフセット */
	offset: number;
	/** 取得件数 */
	limit: number;
}


