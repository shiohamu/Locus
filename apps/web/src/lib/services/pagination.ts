/**
 * ページネーションサービス
 *
 * 配列のページネーションロジックを提供します。
 */

/**
 * 配列をページネーションする
 * @param items アイテム一覧
 * @param currentPage 現在のページ（1から始まる）
 * @param itemsPerPage 1ページあたりのアイテム数
 * @returns ページネーションされたアイテム一覧
 */
export function paginate<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	return items.slice(startIndex, endIndex);
}

/**
 * 総ページ数を計算する
 * @param totalItems 総アイテム数
 * @param itemsPerPage 1ページあたりのアイテム数
 * @returns 総ページ数
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
	return Math.ceil(totalItems / itemsPerPage);
}

