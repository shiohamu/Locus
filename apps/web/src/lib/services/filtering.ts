/**
 * フィルタリングサービス
 *
 * ノートのフィルタリングロジックを提供します。
 */

import type { NoteCore } from "$lib/types";

export type FilterType = "all" | "md" | "rss" | "web_clip";

/**
 * ノートをフィルタリングする
 * @param notes ノート一覧
 * @param filterType フィルタタイプ
 * @returns フィルタリングされたノート一覧
 */
export function filterNotes(notes: NoteCore[], filterType: FilterType): NoteCore[] {
  if (filterType === "all") {
    return notes;
  }
  return notes.filter((note) => note.type === filterType);
}

/**
 * フィルタリングされたノートの数を取得する
 * @param notes ノート一覧
 * @param filterType フィルタタイプ
 * @returns フィルタリングされたノートの数
 */
export function getFilteredCount(notes: NoteCore[], filterType: FilterType): number {
  return filterNotes(notes, filterType).length;
}
