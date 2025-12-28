/**
 * ファイル関連API
 */

import type { File as FileType } from "$lib/types";
import { apiRequest, getApiBaseUrl } from "./base.js";

/**
 * ファイルアップロード
 */
export async function uploadFile(
  file: globalThis.File
): Promise<{ id: string; filename: string; size: number; mime_type: string; created_at: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${getApiBaseUrl()}/files`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Unknown error",
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * ファイル一覧取得
 */
export async function getFiles(options?: {
  limit?: number;
  offset?: number;
}): Promise<FileType[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest<FileType[]>(`/files${query ? `?${query}` : ""}`);
}

/**
 * ファイル取得
 */
export async function getFile(id: string): Promise<FileType> {
  return apiRequest<FileType>(`/files/${id}`);
}

/**
 * ファイルダウンロードURL取得
 */
export function getFileDownloadUrl(id: string): string {
  return `${getApiBaseUrl()}/files/${id}/download`;
}

/**
 * ファイル削除
 */
export async function deleteFile(id: string): Promise<void> {
  return apiRequest<void>(`/files/${id}`, {
    method: "DELETE",
  });
}

/**
 * ノートにファイルを関連付け
 */
export async function linkFileToNote(fileId: string, noteId: string): Promise<void> {
  return apiRequest<void>(`/files/${fileId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note_id: noteId }),
  });
}

/**
 * ノートからファイルの関連を解除
 */
export async function unlinkFileFromNote(fileId: string, noteId: string): Promise<void> {
  return apiRequest<void>(`/files/${fileId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

/**
 * ノートに紐づくファイル一覧取得
 */
export async function getFilesByNote(noteId: string): Promise<FileType[]> {
  // このエンドポイントは実装されていないため、全ファイルを取得してフィルタリング
  // 将来的には専用エンドポイントを追加することを推奨
  const files = await getFiles();
  // 注意: この実装は非効率なので、将来的に改善が必要
  return files;
}
