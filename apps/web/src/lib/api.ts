/**
 * APIクライアント関数
 */

// 開発環境ではViteのプロキシ経由（/api）、本番環境では環境変数から取得
const API_BASE_URL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.DEV ? "/api" : "http://localhost:3000");

/**
 * APIリクエストの共通処理
 */
async function apiRequest<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
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
 * ノートからタグ削除
 */
export async function removeTagFromNote(noteId: string, tagId: string) {
	return apiRequest(`/notes/${noteId}/tags/${tagId}`, {
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
export async function searchNotes(query: string, options?: {
	limit?: number;
	offset?: number;
}) {
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


