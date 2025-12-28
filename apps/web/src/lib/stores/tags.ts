/**
 * タグストア
 *
 * タグ一覧の状態管理を行います。
 */

import { writable } from "svelte/store";
import type { Tag } from "$lib/types";
import { getTags } from "$lib/api";

export interface TagsState {
	tags: Tag[];
	loading: boolean;
	error: unknown | null;
}

const initialState: TagsState = {
	tags: [],
	loading: false,
	error: null,
};

function createTagsStore() {
	const { subscribe, set, update } = writable<TagsState>(initialState);

	return {
		subscribe,
		/**
		 * タグを読み込む
		 */
		async loadTags() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const tags = await getTags();
				update((state) => ({ ...state, tags, loading: false }));
			} catch (error) {
				update((state) => ({ ...state, error, loading: false }));
			}
		},
		/**
		 * タグを追加
		 */
		addTag(tag: Tag) {
			update((state) => ({
				...state,
				tags: [...state.tags, tag],
			}));
		},
		/**
		 * タグを更新
		 */
		updateTag(tag: Tag) {
			update((state) => ({
				...state,
				tags: state.tags.map((t) => (t.id === tag.id ? tag : t)),
			}));
		},
		/**
		 * タグを削除
		 */
		removeTag(tagId: string) {
			update((state) => ({
				...state,
				tags: state.tags.filter((t) => t.id !== tagId),
			}));
		},
		/**
		 * リセット
		 */
		reset() {
			set(initialState);
		},
	};
}

export const tagsStore = createTagsStore();

