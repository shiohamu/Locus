import Parser from "rss-parser";
import TurndownService from "turndown";
import type { RSSFeed, RSSItem, NoteCore } from "@locus/shared";
import * as notesDb from "../db/notes.js";
import * as rssDb from "../db/rss.js";
import * as searchDb from "../db/search.js";

const parser = new Parser();
const turndownService = new TurndownService();

/**
 * RSSフィードを取得し、ノートとして保存する
 */
export async function fetchRSSFeed(feed: RSSFeed): Promise<{
	created: number;
	updated: number;
}> {
	const now = Math.floor(Date.now() / 1000);

	// RSSフィードを取得
	const parsed = await parser.parseURL(feed.url);

	// 既存のアイテムを取得（重複チェック用）
	const existingItems = await rssDb.getItemsByFeed(feed.id);
	const existingUrls = new Set(existingItems.map((item) => item.url));

	let created = 0;
	let updated = 0;

	// 各アイテムを処理
	for (const item of parsed.items) {
		if (!item.link || !item.title) {
			continue;
		}

		// 既に存在する場合はスキップ
		if (existingUrls.has(item.link)) {
			continue;
		}

		// 公開日時を取得
		const publishedAt = item.pubDate
			? Math.floor(new Date(item.pubDate).getTime() / 1000)
			: now;

		// HTMLコンテンツをMarkdownに変換
		const content = item.contentSnippet || item.content || "";
		const markdown = content
			? turndownService.turndown(content)
			: item.title;

		// ノートIDを生成
		const noteId = crypto.randomUUID();

		// ノートコアを作成
		const noteCore: NoteCore = {
			id: noteId,
			type: "rss",
			title: item.title,
			created_at: publishedAt,
			updated_at: publishedAt,
			deleted_at: null,
		};

		// ノートを保存
		await notesDb.createNote(noteCore);

		// RSSアイテムを作成
		const rssItem: RSSItem = {
			note_id: noteId,
			feed_id: feed.id,
			url: item.link,
			content: markdown,
			published_at: publishedAt,
		};

		await rssDb.createItem(rssItem);

		// FTSインデックスを更新
		await searchDb.updateFTS(noteId, item.title, markdown);

		created++;
	}

	// フィードの最終取得日時を更新
	const updatedFeed: RSSFeed = {
		...feed,
		last_fetched_at: now,
	};
	await rssDb.updateFeed(updatedFeed);

	return { created, updated };
}

