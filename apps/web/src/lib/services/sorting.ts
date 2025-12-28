/**
 * ソートサービス
 *
 * ノートのソートロジックを提供します。
 */

import type { NoteCore } from "$lib/types";

export type SortBy = "updated_at" | "created_at" | "title";
export type SortOrder = "desc" | "asc";

/**
 * ノートをソートする
 * @param notes ノート一覧
 * @param sortBy ソート基準
 * @param sortOrder ソート順序
 * @returns ソートされたノート一覧
 */
export function sortNotes(notes: NoteCore[], sortBy: SortBy, sortOrder: SortOrder): NoteCore[] {
  const sorted = [...notes];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title, "ja");
    } else if (sortBy === "updated_at") {
      comparison = a.updated_at - b.updated_at;
    } else if (sortBy === "created_at") {
      comparison = a.created_at - b.created_at;
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });
  return sorted;
}
