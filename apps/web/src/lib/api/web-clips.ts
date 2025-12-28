/**
 * Webクリップ関連API
 */

import type { WebClip } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * Webクリップ作成
 */
export async function createWebClip(url: string): Promise<WebClip> {
  return apiRequest<WebClip>("/web-clips", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

/**
 * Webクリップ一覧取得
 */
export async function getWebClips(options?: {
  limit?: number;
  offset?: number;
}): Promise<WebClip[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest<WebClip[]>(`/web-clips${query ? `?${query}` : ""}`);
}

/**
 * Webクリップ取得
 */
export async function getWebClip(noteId: string): Promise<WebClip> {
  return apiRequest<WebClip>(`/web-clips/${noteId}`);
}

/**
 * Webクリップ更新（再取得）
 */
export async function refetchWebClip(noteId: string): Promise<WebClip> {
  return apiRequest<WebClip>(`/web-clips/${noteId}`, {
    method: "PUT",
  });
}

/**
 * Webクリップ削除
 */
export async function deleteWebClip(noteId: string): Promise<void> {
  return apiRequest<void>(`/web-clips/${noteId}`, {
    method: "DELETE",
  });
}
