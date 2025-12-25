/**
 * 同期プルリクエスト
 */
export interface SyncPullRequest {
	/** 最終同期日時（Unix timestamp、秒単位） */
	since: number;
}

/**
 * 同期プルレスポンス
 */
export interface SyncPullResponse {
	/** 更新されたノート（notes_core） */
	notes: Array<{
		core: import("./note.js").NoteCore;
		md?: import("./note.js").NoteMD;
		rss?: import("./rss.js").RSSItem;
	}>;
	/** 更新されたタグ */
	tags: import("./tag.js").Tag[];
	/** 更新されたリンク */
	links: import("./link.js").Link[];
	/** 更新されたRSSフィード */
	feeds: import("./rss.js").RSSFeed[];
}

/**
 * 同期プッシュリクエスト
 */
export interface SyncPushRequest {
	/** 送信するノート */
	notes: Array<{
		core: import("./note.js").NoteCore;
		md?: import("./note.js").NoteMD;
		rss?: import("./rss.js").RSSItem;
	}>;
	/** 送信するタグ */
	tags: import("./tag.js").Tag[];
	/** 送信するリンク */
	links: import("./link.js").Link[];
	/** 送信するRSSフィード */
	feeds: import("./rss.js").RSSFeed[];
}




