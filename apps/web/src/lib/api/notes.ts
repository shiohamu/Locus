/**
 * ノート関連API
 */

import type { NoteCore, NoteMD } from "$lib/types";
import type {
  CreateNoteMDRequest,
  NoteLinksResponse,
  TagSuggestionsResponse,
  UpdateNoteMDRequest,
} from "$lib/types/api";
import { apiRequest } from "./base.js";
import { apiCache } from "./cache.js";

/**
 * ノート一覧取得
 * @param options 取得オプション
 * @param options.type ノートタイプ（"md" | "rss"）
 * @param options.limit 取得件数
 * @param options.offset オフセット
 * @returns ノート一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNotes(options?: {
  type?: "md" | "rss";
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest<NoteCore[]>(`/notes${query ? `?${query}` : ""}`, {
    useCache: true,
    cacheTTL: 2 * 60 * 1000, // 2分
  });
}

/**
 * ノート取得
 * @param id ノートID
 * @returns ノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNote(id: string): Promise<NoteCore> {
  return apiRequest<NoteCore>(`/notes/${id}`, {
    useCache: true,
    cacheTTL: 1 * 60 * 1000, // 1分
  });
}

/**
 * ノート作成
 * @param note ノート情報
 * @returns 作成されたノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function createNote(note: Partial<NoteCore>): Promise<NoteCore> {
  const result = await apiRequest<NoteCore>("/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });
  // ノート一覧のキャッシュを無効化
  apiCache.deletePattern("/notes");
  return result;
}

/**
 * ノート更新
 * @param id ノートID
 * @param note 更新するノート情報
 * @returns 更新されたノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function updateNote(id: string, note: Partial<NoteCore>): Promise<NoteCore> {
  const result = await apiRequest<NoteCore>(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
  // ノート一覧と該当ノートのキャッシュを無効化
  apiCache.deletePattern("/notes");
  apiCache.delete(`/notes/${id}`);
  return result;
}

/**
 * ノート削除
 * @param id ノートID
 * @throws {Error} APIエラーが発生した場合
 */
export async function deleteNote(id: string): Promise<void> {
  await apiRequest<void>(`/notes/${id}`, {
    method: "DELETE",
  });
  // ノート一覧と該当ノートのキャッシュを無効化
  apiCache.deletePattern("/notes");
  apiCache.delete(`/notes/${id}`);
}

/**
 * ノート一括削除
 * @param noteIds ノートIDの配列
 * @throws {Error} APIエラーが発生した場合
 */
export async function deleteNotesBatch(noteIds: string[]): Promise<void> {
  if (noteIds.length === 0) {
    return;
  }

  await apiRequest<void>("/notes/batch", {
    method: "DELETE",
    body: JSON.stringify({ note_ids: noteIds }),
  });
  // ノート一覧のキャッシュを無効化
  apiCache.deletePattern("/notes");
  // 各ノートのキャッシュも無効化
  noteIds.forEach((id) => {
    apiCache.delete(`/notes/${id}`);
  });
}

/**
 * Markdownノート作成
 * @param data ノート作成データ
 * @returns 作成されたMarkdownノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function createNoteMD(data: CreateNoteMDRequest): Promise<NoteMD> {
  const result = await apiRequest<NoteMD>("/notes/md", {
    method: "POST",
    body: JSON.stringify(data),
  });
  // ノート一覧のキャッシュを無効化
  apiCache.deletePattern("/notes");
  return result;
}

/**
 * Markdownノート取得
 * @param noteId ノートID
 * @returns Markdownノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNoteMD(noteId: string): Promise<NoteMD> {
  return apiRequest<NoteMD>(`/notes/md/${noteId}`, {
    useCache: true,
    cacheTTL: 1 * 60 * 1000, // 1分
  });
}

/**
 * Markdownノート更新
 * @param id ノートID
 * @param data 更新データ
 * @returns 更新されたMarkdownノート情報
 * @throws {Error} APIエラーが発生した場合
 */
export async function updateNoteMD(id: string, data: UpdateNoteMDRequest): Promise<NoteMD> {
  const result = await apiRequest<NoteMD>(`/notes/md/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  // ノート一覧と該当ノートのキャッシュを無効化
  apiCache.deletePattern("/notes");
  apiCache.delete(`/notes/md/${id}`);
  return result;
}

/**
 * ノートのリンク取得
 * @param noteId ノートID
 * @returns ノートのリンク一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNoteLinks(noteId: string): Promise<NoteLinksResponse[]> {
  return apiRequest<NoteLinksResponse[]>(`/notes/${noteId}/links`);
}

/**
 * タグでフィルタリングされたノート一覧取得
 * @param options 取得オプション
 * @param options.tagNames タグ名の配列
 * @param options.type ノートタイプ（"md" | "rss"）
 * @param options.limit 取得件数
 * @param options.offset オフセット
 * @returns ノート一覧
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNotesByTags(options: {
  tagNames: string[];
  type?: "md" | "rss";
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const params = new URLSearchParams();
  if (options.tagNames.length > 0) {
    params.set("tags", options.tagNames.join(","));
  }
  if (options.type) params.set("type", options.type);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest<NoteCore[]>(`/notes${query ? `?${query}` : ""}`, {
    useCache: true,
    cacheTTL: 2 * 60 * 1000, // 2分
  });
}

/**
 * ノート一覧とタグ情報を一度に取得（最適化版）
 * @param options 取得オプション
 * @param options.tagNames タグ名の配列
 * @param options.type ノートタイプ（"md" | "rss"）
 * @param options.limit 取得件数
 * @param options.offset オフセット
 * @returns ノート一覧とタグマップ
 * @throws {Error} APIエラーが発生した場合
 */
export async function getNotesWithTags(options: {
  tagNames?: string[];
  type?: "md" | "rss";
  limit?: number;
  offset?: number;
}): Promise<{
  notes: NoteCore[];
  tagsMap: Record<string, string[]>;
}> {
  const params = new URLSearchParams();
  if (options.tagNames && options.tagNames.length > 0) {
    params.set("tags", options.tagNames.join(","));
  }
  if (options.type) params.set("type", options.type);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest<{ notes: NoteCore[]; tagsMap: Record<string, string[]> }>(
    `/notes/with-tags${query ? `?${query}` : ""}`,
    {
      useCache: true,
      cacheTTL: 2 * 60 * 1000, // 2分
    }
  );
}
