/**
 * タグサービス
 *
 * タグ関連のビジネスロジックを提供します。
 */

import { getTags, createTag, deleteTag } from "$lib/api";
import type { CreateTagRequest } from "$lib/types/api";

/**
 * タグサービス
 */
export class TagsService {
	/**
	 * タグ一覧を取得する
	 */
	async getTags() {
		return getTags();
	}

	/**
	 * タグを作成する
	 */
	async createTag(tag: CreateTagRequest) {
		return createTag(tag);
	}

	/**
	 * タグを削除する
	 */
	async deleteTag(tagId: string): Promise<void> {
		return deleteTag(tagId);
	}
}

export const tagsService = new TagsService();

