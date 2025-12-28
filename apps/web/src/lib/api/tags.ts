/**
 * タグ関連API
 */

import type { Tag } from "$lib/types";
import type { CreateTagRequest, TagSuggestionsResponse } from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
 * タグ一覧取得
 */
export async function getTags(): Promise<Tag[]> {
  return apiRequest<Tag[]>("/tags");
}

/**
 * タグ作成
 */
export async function createTag(tag: CreateTagRequest): Promise<Tag> {
  return apiRequest<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(tag),
  });
}

/**
 * ノートにタグ追加
 */
export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  return apiRequest<void>(`/notes/${noteId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag_id: tagId }),
  });
}

/**
 * ノートに紐づくタグ一覧取得
 */
export async function getTagsByNote(noteId: string): Promise<Tag[]> {
  return apiRequest<Tag[]>(`/notes/${noteId}/tags`);
}

/**
 * ノートからタグ削除
 */
export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  return apiRequest<void>(`/notes/${noteId}/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * タグ削除
 */
export async function deleteTag(tagId: string): Promise<void> {
  return apiRequest<void>(`/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * タグ候補生成
 */
export async function generateTagSuggestions(noteId: string): Promise<TagSuggestionsResponse> {
  return apiRequest<TagSuggestionsResponse>(`/notes/${noteId}/tags/suggestions`, {
    method: "POST",
  });
}
