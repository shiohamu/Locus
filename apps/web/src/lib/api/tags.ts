/**
 * タグ関連API
 */

import type { Tag } from "$lib/types";
import type { CreateTagRequest, TagSuggestionsResponse } from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
 * タグ一覧取得
 * @returns タグ一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function getTags(): Promise<Tag[]> {
  return apiRequest<Tag[]>("/tags", {
    useCache: true,
    cacheTTL: 5 * 60 * 1000, // 5分（タグは頻繁に変更されない）
  });
}

/**
 * タグ作成
 * @param tag タグ作成データ
 * @returns 作成されたタグ情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function createTag(tag: CreateTagRequest): Promise<Tag> {
  return apiRequest<Tag>("/tags", {
    method: "POST",
    body: JSON.stringify(tag),
  });
}

/**
 * ノートにタグ追加
 * @param noteId ノートID
 * @param tagId タグID
 * @throws {Error} APIエラーが発生した場合
 */
export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  return apiRequest<void>(`/notes/${noteId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag_id: tagId }),
  });
}

/**
 * ノートに紐づくタグ一覧取得
 * @param noteId ノートID
 * @returns タグ一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function getTagsByNote(noteId: string): Promise<Tag[]> {
  return apiRequest<Tag[]>(`/notes/${noteId}/tags`);
}

/**
 * ノートからタグ削除
 * @param noteId ノートID
 * @param tagId タグID
 * @throws {Error} APIエラーが発生した場合
 */
export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  return apiRequest<void>(`/notes/${noteId}/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * タグ削除
 * @param tagId タグID
 * @throws {Error} APIエラーが発生した場合
 */
export async function deleteTag(tagId: string): Promise<void> {
  return apiRequest<void>(`/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * タグ候補生成
 * @param noteId ノートID
 * @returns タグ候補一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function generateTagSuggestions(noteId: string): Promise<TagSuggestionsResponse> {
  return apiRequest<TagSuggestionsResponse>(`/notes/${noteId}/tags/suggestions`, {
    method: "POST",
  });
}
