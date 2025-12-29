/**
 * ノートストア
 *
 * ノート一覧の状態管理を行います。
 */

import { getNotes, getNotesByTags } from "$lib/api";
import { getFiles } from "$lib/api/files";
import { getTagsByNote } from "$lib/api/tags";
import { type FilterType, filterNotes } from "$lib/services/filtering";
import { type SortBy, type SortOrder, sortNotes } from "$lib/services/sorting";
import type { File, NoteCore } from "$lib/types";
import { derived, get, writable } from "svelte/store";

// 型を再エクスポート
export type { FilterType } from "$lib/services/filtering";
export type { SortBy, SortOrder } from "$lib/services/sorting";
import { calculateTotalPages, paginate } from "$lib/services/pagination";

export interface NotesState {
  allNotes: NoteCore[];
  allFiles: File[]; // ノート一覧に表示するファイル
  noteTagsMap: Map<string, string[]>; // ノートID -> タグ名の配列
  loading: boolean;
  error: unknown | null;
  filterType: FilterType;
  filterTags: string[]; // タグフィルター
  sortBy: SortBy;
  sortOrder: SortOrder;
  currentPage: number;
  itemsPerPage: number;
}

const initialState: NotesState = {
  allNotes: [],
  allFiles: [],
  noteTagsMap: new Map(),
  loading: false,
  error: null,
  filterType: "all",
  filterTags: [],
  sortBy: "updated_at",
  sortOrder: "desc",
  currentPage: 1,
  itemsPerPage: 20,
};

function createNotesStore() {
  const store = writable<NotesState>(initialState);
  const { subscribe, set, update } = store;

  return {
    subscribe,
    /**
     * ノートを読み込む
     */
    async loadNotes() {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const currentState = get(store);
        let notes: NoteCore[];
        if (currentState.filterTags.length > 0) {
          notes = await getNotesByTags({
            tagNames: currentState.filterTags,
            type: currentState.filterType !== "all" ? currentState.filterType : undefined,
            limit: 10000,
          });
        } else {
          notes = await getNotes({
            type: currentState.filterType !== "all" ? currentState.filterType : undefined,
            limit: 10000,
          });
        }

        // タグ情報を取得（バッチ処理で効率化）
        const tagsMap = new Map<string, string[]>();
        await Promise.all(
          notes.map(async (note) => {
            try {
              const tags = await getTagsByNote(note.id);
              tagsMap.set(note.id, tags.map((t) => t.name).sort());
            } catch {
              // タグ取得に失敗した場合は空配列
              tagsMap.set(note.id, []);
            }
          })
        );

        // ノート一覧に表示するファイルを取得
        const allFiles = await getFiles({ limit: 10000 });
        const filesForNotes = allFiles.filter((file) => file.show_in_notes);

        update((state) => ({
          ...state,
          allNotes: notes,
          allFiles: filesForNotes,
          noteTagsMap: tagsMap,
          loading: false,
        }));
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
     * タグフィルターを設定
     */
    setTagFilter(tagNames: string[]) {
      update((state) => ({ ...state, filterTags: tagNames, currentPage: 1 }));
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
 * ファイルをNoteCore形式に変換（ノート一覧表示用）
 */
function fileToNoteCore(file: File): NoteCore {
  return {
    id: file.id,
    type: "md", // ファイルは一時的にmdタイプとして扱う（表示用）
    title: file.filename,
    created_at: file.created_at,
    updated_at: file.created_at,
    deleted_at: null,
    public: 0,
  };
}

/**
 * フィルタリング・ソート・ページネーションされたノートを導出
 */
export const filteredNotes = derived(notesStore, ($store) => {
  // ノートとファイルを結合
  const fileNotes = $store.allFiles.map(fileToNoteCore);
  const allItems = [...$store.allNotes, ...fileNotes];

  let filtered = filterNotes(allItems, $store.filterType);
  filtered = sortNotes(filtered, $store.sortBy, $store.sortOrder, $store.noteTagsMap);
  return paginate(filtered, $store.currentPage, $store.itemsPerPage);
});

/**
 * 総ページ数を導出
 */
export const totalPages = derived(notesStore, ($store) => {
  const fileNotes = $store.allFiles.map(fileToNoteCore);
  const allItems = [...$store.allNotes, ...fileNotes];
  const filteredCount = filterNotes(allItems, $store.filterType).length;
  return calculateTotalPages(filteredCount, $store.itemsPerPage);
});

/**
 * フィルタリングされたノートの総数を導出
 */
export const filteredCount = derived(notesStore, ($store) => {
  const fileNotes = $store.allFiles.map(fileToNoteCore);
  const allItems = [...$store.allNotes, ...fileNotes];
  return filterNotes(allItems, $store.filterType).length;
});
