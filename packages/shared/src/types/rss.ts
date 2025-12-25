/**
 * RSSフィード
 */
export interface RSSFeed {
	/** フィードID（UUID v4） */
	id: string;
	/** フィードURL */
	url: string;
	/** フィードタイトル */
	title: string;
	/** 最終取得日時（Unix timestamp、秒単位） */
	last_fetched_at: number | null;
}

/**
 * RSSアイテム
 */
export interface RSSItem {
	/** ノートID（notes_core.idと一致） */
	note_id: string;
	/** フィードID */
	feed_id: string;
	/** 記事URL */
	url: string;
	/** 記事コンテンツ（Markdown形式） */
	content: string;
	/** 公開日時（Unix timestamp、秒単位） */
	published_at: number;
}




