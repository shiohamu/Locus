/**
 * ソートサービス
 *
 * ノートのソートロジックを提供します。
 */

import type { NoteCore } from "$lib/types";

export type SortBy = "updated_at" | "created_at" | "title" | "tag";
export type SortOrder = "desc" | "asc";

/**
 * ノートをソートする
 * @param notes ノート一覧
 * @param sortBy ソート基準
 * @param sortOrder ソート順序
 * @param noteTagsMap ノートID -> タグ名の配列のマップ（タグソート時に使用）
 * @returns ソートされたノート一覧
 */
export function sortNotes(
  notes: NoteCore[],
  sortBy: SortBy,
  sortOrder: SortOrder,
  noteTagsMap?: Map<string, string[]>
): NoteCore[] {
  const sorted = [...notes];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title, "ja");
    } else if (sortBy === "updated_at") {
      comparison = a.updated_at - b.updated_at;
    } else if (sortBy === "created_at") {
      comparison = a.created_at - b.created_at;
    } else if (sortBy === "tag") {
      // タグでソート（最初のタグ名で比較、タグがない場合は最後に）
      const tagsA = noteTagsMap?.get(a.id) || [];
      const tagsB = noteTagsMap?.get(b.id) || [];
      const tagA = tagsA[0] || "";
      const tagB = tagsB[0] || "";

      if (tagA === "" && tagB === "") {
        comparison = 0; // 両方タグなし
      } else if (tagA === "") {
        comparison = 1; // Aがタグなし（後ろに）
      } else if (tagB === "") {
        comparison = -1; // Bがタグなし（後ろに）
      } else {
        comparison = tagA.localeCompare(tagB, "ja");
      }
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });
  return sorted;
}
