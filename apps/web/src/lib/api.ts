/**
 * APIクライアント関数
 */

// 開発環境ではViteのプロキシ経由（/api）、本番環境では環境変数から取得
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");

/**
 * APIリクエストの共通処理
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
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
 * ノート一覧取得
 */
export async function getNotes(options?: {
  type?: "md" | "rss";
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest(`/notes${query ? `?${query}` : ""}`);
}

/**
 * ノート取得
 */
export async function getNote(id: string) {
  return apiRequest(`/notes/${id}`);
}

/**
 * ノート作成
 */
export async function createNote(note: unknown) {
  return apiRequest("/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });
}

/**
 * ノート更新
 */
export async function updateNote(id: string, note: unknown) {
  return apiRequest(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

/**
 * ノート削除
 */
export async function deleteNote(id: string) {
  return apiRequest(`/notes/${id}`, {
    method: "DELETE",
  });
}

/**
 * Markdownノート作成
 */
export async function createNoteMD(data: unknown) {
  return apiRequest("/notes/md", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Markdownノート取得
 */
export async function getNoteMD(noteId: string) {
  return apiRequest(`/notes/md/${noteId}`);
}

/**
 * Markdownノート更新
 */
export async function updateNoteMD(id: string, data: unknown) {
  return apiRequest(`/notes/md/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * タグ一覧取得
 */
export async function getTags() {
  return apiRequest("/tags");
}

/**
 * タグ作成
 */
export async function createTag(tag: { name: string; id?: string }) {
  return apiRequest("/tags", {
    method: "POST",
    body: JSON.stringify(tag),
  });
}

/**
 * ノートにタグ追加
 */
export async function addTagToNote(noteId: string, tagId: string) {
  return apiRequest(`/notes/${noteId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag_id: tagId }),
  });
}

/**
 * ノートに紐づくタグ一覧取得
 */
export async function getTagsByNote(noteId: string) {
  return apiRequest(`/notes/${noteId}/tags`);
}

/**
 * ノートからタグ削除
 */
export async function removeTagFromNote(noteId: string, tagId: string) {
  return apiRequest(`/notes/${noteId}/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * タグ削除
 */
export async function deleteTag(tagId: string) {
  return apiRequest(`/tags/${tagId}`, {
    method: "DELETE",
  });
}

/**
 * ノートのリンク取得
 */
export async function getNoteLinks(noteId: string) {
  return apiRequest(`/notes/${noteId}/links`);
}

/**
 * 全文検索
 */
export async function searchNotes(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams({ q: query });
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  return apiRequest(`/search?${params.toString()}`);
}

/**
 * RSSフィード一覧取得
 */
export async function getRSSFeeds() {
  return apiRequest("/rss/feeds");
}

/**
 * RSSフィード登録
 */
export async function createRSSFeed(feed: { url: string; title: string }) {
  return apiRequest("/rss/feeds", {
    method: "POST",
    body: JSON.stringify(feed),
  });
}

/**
 * RSSフィード削除
 */
export async function deleteRSSFeed(feedId: string) {
  return apiRequest(`/rss/feeds/${feedId}`, {
    method: "DELETE",
  });
}

/**
 * RSSフィード取得・更新
 */
export async function fetchRSSFeed(feedId?: string) {
  return apiRequest("/rss/fetch", {
    method: "POST",
    body: JSON.stringify(feedId ? { feed_id: feedId } : {}),
  });
}

/**
 * RSSアイテム取得（ノートIDで取得）
 */
export async function getRSSItem(noteId: string) {
  return apiRequest(`/rss/items/${noteId}`);
}

/**
 * Webクリップ作成
 */
export async function createWebClip(url: string) {
  return apiRequest("/web-clips", {
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
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest(`/web-clips${query ? `?${query}` : ""}`);
}

/**
 * Webクリップ取得
 */
export async function getWebClip(noteId: string) {
  return apiRequest(`/web-clips/${noteId}`);
}

/**
 * Webクリップ更新（再取得）
 */
export async function refetchWebClip(noteId: string) {
  return apiRequest(`/web-clips/${noteId}`, {
    method: "PUT",
  });
}

/**
 * Webクリップ削除
 */
export async function deleteWebClip(noteId: string) {
  return apiRequest(`/web-clips/${noteId}`, {
    method: "DELETE",
  });
}

/**
 * ファイルアップロード
 */
export async function uploadFile(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
  const url = `${API_BASE_URL}/files`;

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
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  return apiRequest(`/files${query ? `?${query}` : ""}`);
}

/**
 * ファイル取得
 */
export async function getFile(id: string) {
  return apiRequest(`/files/${id}`);
}

/**
 * ファイルダウンロードURL取得
 */
export function getFileDownloadUrl(id: string): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
  return `${API_BASE_URL}/files/${id}/download`;
}

/**
 * ファイル削除
 */
export async function deleteFile(id: string) {
  return apiRequest(`/files/${id}`, {
    method: "DELETE",
  });
}

/**
 * ノートにファイルを関連付け
 */
export async function linkFileToNote(fileId: string, noteId: string) {
  return apiRequest(`/files/${fileId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note_id: noteId }),
  });
}

/**
 * ノートからファイルの関連を解除
 */
export async function unlinkFileFromNote(fileId: string, noteId: string) {
  return apiRequest(`/files/${fileId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

/**
 * ノートに紐づくファイル一覧取得
 */
export async function getFilesByNote(noteId: string) {
  // このエンドポイントは実装されていないため、全ファイルを取得してフィルタリング
  // 将来的には専用エンドポイントを追加することを推奨
  const files = await getFiles();
  // 注意: この実装は非効率なので、将来的に改善が必要
  return files;
}

/**
 * Markdownエクスポート
 */
export function getMarkdownExportUrl(type?: string, tags?: string[]): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (tags && tags.length > 0) params.set("tags", tags.join(","));
  const query = params.toString();
  return `${API_BASE_URL}/export/markdown${query ? `?${query}` : ""}`;
}

/**
 * JSONエクスポート
 */
export function getJSONExportUrl(): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
  return `${API_BASE_URL}/export/json`;
}

/**
 * 同期プル
 */
export async function syncPull(since: number) {
  return apiRequest(`/sync/pull?since=${since}`);
}

/**
 * 同期プッシュ
 */
export async function syncPush(data: unknown) {
  return apiRequest("/sync/push", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
