/**
 * ノートサービス
 *
 * ノート関連のビジネスロジックを提供します。
 */

import { createNote, deleteNote, getNote, getNotes, updateNote } from "$lib/api";
import type { NoteCore } from "$lib/types";
import { type FilterType, filterNotes } from "./filtering";
import { paginate } from "./pagination";
import { type SortBy, type SortOrder, sortNotes } from "./sorting";

export interface NotesServiceOptions {
  filterType?: FilterType;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  currentPage?: number;
  itemsPerPage?: number;
}

export interface NotesServiceResult {
  notes: NoteCore[];
  total: number;
}

/**
 * ノートサービス
 */
export class NotesService {
  /**
   * ノート一覧を取得する（フィルタリング・ソート・ページネーション適用）
   */
  async getNotes(options: NotesServiceOptions = {}): Promise<NotesServiceResult> {
    const allNotes = await getNotes({ limit: 10000 });

    let filtered = filterNotes(allNotes, options.filterType || "all");
    filtered = sortNotes(filtered, options.sortBy || "updated_at", options.sortOrder || "desc");

    if (options.currentPage && options.itemsPerPage) {
      filtered = paginate(filtered, options.currentPage, options.itemsPerPage);
    }

    return {
      notes: filtered,
      total: allNotes.length,
    };
  }

  /**
   * ノートを取得する
   */
  async getNote(id: string): Promise<NoteCore> {
    return getNote(id);
  }

  /**
   * ノートを作成する
   */
  async createNote(note: Partial<NoteCore>): Promise<NoteCore> {
    return createNote(note);
  }

  /**
   * ノートを更新する
   */
  async updateNote(id: string, note: Partial<NoteCore>): Promise<NoteCore> {
    return updateNote(id, note);
  }

  /**
   * ノートを削除する
   */
  async deleteNote(id: string): Promise<void> {
    return deleteNote(id);
  }
}

export const notesService = new NotesService();
