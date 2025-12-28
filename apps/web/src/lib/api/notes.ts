/**
 * ノート関連API
 */

import type { NoteCore, NoteMD } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * ノート一覧取得
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
  return apiRequest<NoteCore[]>(`/notes${query ? `?${query}` : ""}`);
}

/**
 * ノート取得
 */
export async function getNote(id: string): Promise<NoteCore> {
  return apiRequest<NoteCore>(`/notes/${id}`);
}

/**
 * ノート作成
 */
export async function createNote(note: Partial<NoteCore>): Promise<NoteCore> {
  return apiRequest<NoteCore>("/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });
}

/**
 * ノート更新
 */
export async function updateNote(id: string, note: Partial<NoteCore>): Promise<NoteCore> {
  return apiRequest<NoteCore>(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

/**
 * ノート削除
 */
export async function deleteNote(id: string): Promise<void> {
  return apiRequest<void>(`/notes/${id}`, {
    method: "DELETE",
  });
}

/**
 * Markdownノート作成
 */
export async function createNoteMD(data: { title: string; content: string }): Promise<NoteMD> {
  return apiRequest<NoteMD>("/notes/md", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Markdownノート取得
 */
export async function getNoteMD(noteId: string): Promise<NoteMD> {
  return apiRequest<NoteMD>(`/notes/md/${noteId}`);
}

/**
 * Markdownノート更新
 */
export async function updateNoteMD(
  id: string,
  data: { title?: string; content?: string }
): Promise<NoteMD> {
  return apiRequest<NoteMD>(`/notes/md/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * ノートのリンク取得
 */
export async function getNoteLinks(noteId: string): Promise<Array<{ from: string; to: string }>> {
  return apiRequest<Array<{ from: string; to: string }>>(`/notes/${noteId}/links`);
}
