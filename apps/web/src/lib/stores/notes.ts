/**
 * ノートストア
 *
 * ノート一覧の状態管理を行います。
 */

import { writable, derived } from "svelte/store";
import type { NoteCore } from "$lib/types";
import { getNotes } from "$lib/api";
import { filterNotes, type FilterType } from "$lib/services/filtering";
import { sortNotes, type SortBy, type SortOrder } from "$lib/services/sorting";

// 型を再エクスポート
export type { FilterType } from "$lib/services/filtering";
export type { SortBy, SortOrder } from "$lib/services/sorting";
import { paginate, calculateTotalPages } from "$lib/services/pagination";

export interface NotesState {
	allNotes: NoteCore[];
	loading: boolean;
	error: unknown | null;
	filterType: FilterType;
	sortBy: SortBy;
	sortOrder: SortOrder;
	currentPage: number;
	itemsPerPage: number;
}

const initialState: NotesState = {
	allNotes: [],
	loading: false,
	error: null,
	filterType: "all",
	sortBy: "updated_at",
	sortOrder: "desc",
	currentPage: 1,
	itemsPerPage: 20,
};

function createNotesStore() {
	const { subscribe, set, update } = writable<NotesState>(initialState);

	return {
		subscribe,
		/**
		 * ノートを読み込む
		 */
		async loadNotes() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const notes = await getNotes({ limit: 10000 });
				update((state) => ({ ...state, allNotes: notes, loading: false }));
			} catch (error) {
				update((state) => ({ ...state, error, loading: false }));
			}
		},
		/**
		 * フィルタを設定
		 */
		setFilter(filterType: FilterType) {
			update((state) => ({ ...state, filterType, currentPage: 1 }));
		},
		/**
		 * ソートを設定
		 */
		setSort(sortBy: SortBy, sortOrder: SortOrder) {
			update((state) => ({ ...state, sortBy, sortOrder }));
		},
		/**
		 * ページを設定
		 */
		setPage(page: number) {
			update((state) => ({ ...state, currentPage: page }));
		},
		/**
		 * 1ページあたりのアイテム数を設定
		 */
		setItemsPerPage(itemsPerPage: number) {
			update((state) => ({ ...state, itemsPerPage, currentPage: 1 }));
		},
		/**
		 * ノートを追加（新規作成時など）
		 */
		addNote(note: NoteCore) {
			update((state) => ({
				...state,
				allNotes: [note, ...state.allNotes],
			}));
		},
		/**
		 * ノートを更新
		 */
		updateNote(note: NoteCore) {
			update((state) => ({
				...state,
				allNotes: state.allNotes.map((n) => (n.id === note.id ? note : n)),
			}));
		},
		/**
		 * ノートを削除
		 */
		removeNote(noteId: string) {
			update((state) => ({
				...state,
				allNotes: state.allNotes.filter((n) => n.id !== noteId),
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

export const notesStore = createNotesStore();

/**
 * フィルタリング・ソート・ページネーションされたノートを導出
 */
export const filteredNotes = derived(notesStore, ($store) => {
	let filtered = filterNotes($store.allNotes, $store.filterType);
	filtered = sortNotes(filtered, $store.sortBy, $store.sortOrder);
	return paginate(filtered, $store.currentPage, $store.itemsPerPage);
});

/**
 * 総ページ数を導出
 */
export const totalPages = derived(notesStore, ($store) => {
	const filteredCount = filterNotes($store.allNotes, $store.filterType).length;
	return calculateTotalPages(filteredCount, $store.itemsPerPage);
});

/**
 * フィルタリングされたノートの総数を導出
 */
export const filteredCount = derived(notesStore, ($store) => {
	return filterNotes($store.allNotes, $store.filterType).length;
});

