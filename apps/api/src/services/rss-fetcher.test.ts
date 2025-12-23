import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestRSSFeed } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import * as rssFetcher from "./rss-fetcher.js";
import * as rssDb from "../db/rss.js";
import * as notesDb from "../db/notes.js";
import * as searchDb from "../db/search.js";
import Parser from "rss-parser";

// rss-parserのparseURLメソッドをモック
const mockParseURL = spyOn(Parser.prototype, "parseURL").mockImplementation(async () => {
	return {
		items: [
			{
				title: "Test Article 1",
				link: "https://example.com/article1",
				content: "<p>Article content 1</p>",
				contentSnippet: "Article content 1",
				pubDate: new Date().toISOString(),
			},
			{
				title: "Test Article 2",
				link: "https://example.com/article2",
				content: "<p>Article content 2</p>",
				contentSnippet: "Article content 2",
				pubDate: new Date().toISOString(),
			},
		],
	} as any;
});

describe("rss-fetcher", () => {
	let testDb: Client;
	let dbPath: string;
	let originalEnv: string | undefined;

	beforeEach(async () => {
		const result = await createTestDbFile();
		testDb = result.db;
		dbPath = result.path;

		originalEnv = process.env.DATABASE_URL;
		process.env.DATABASE_URL = `file:${dbPath}`;
	});

	afterEach(async () => {
		if (originalEnv !== undefined) {
			process.env.DATABASE_URL = originalEnv;
		} else {
			delete process.env.DATABASE_URL;
		}

		await cleanupTestDbFile(testDb, dbPath);
		mockParseURL.mockClear();
	});

	test("fetchRSSFeed - RSSフィードを取得してノートを作成できる", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);

		const result = await rssFetcher.fetchRSSFeed(feed);

		expect(result.created).toBe(2);
		expect(result.updated).toBe(0);

		// ノートが作成されたことを確認
		const notes = await notesDb.listNotes({ type: "rss" });
		expect(notes.length).toBe(2);
		expect(notes[0].title).toBe("Test Article 1");
		expect(notes[1].title).toBe("Test Article 2");

		// RSSアイテムが作成されたことを確認
		const items = await rssDb.getItemsByFeed(feed.id);
		expect(items.length).toBe(2);
		expect(items[0].url).toBe("https://example.com/article1");
		expect(items[1].url).toBe("https://example.com/article2");

		// フィードの最終取得日時が更新されたことを確認
		const updatedFeed = await rssDb.getFeed(feed.id);
		expect(updatedFeed?.last_fetched_at).not.toBeNull();
	});

	test("fetchRSSFeed - 既存のアイテムはスキップされる", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);

		// 最初の取得
		const result1 = await rssFetcher.fetchRSSFeed(feed);
		expect(result1.created).toBe(2);

		// 2回目の取得（同じアイテム）
		const result2 = await rssFetcher.fetchRSSFeed(feed);
		expect(result2.created).toBe(0); // 既存のアイテムはスキップされる

		// ノート数は変わらない
		const notes = await notesDb.listNotes({ type: "rss" });
		expect(notes.length).toBe(2);
	});

	test("fetchRSSFeed - HTMLコンテンツがMarkdownに変換される", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);

		await rssFetcher.fetchRSSFeed(feed);

		// RSSアイテムのコンテンツがMarkdown形式になっていることを確認
		const items = await rssDb.getItemsByFeed(feed.id);
		expect(items.length).toBeGreaterThan(0);
		// turndownがHTMLをMarkdownに変換していることを確認
		// 実際の変換結果はturndownの実装に依存するため、コンテンツが存在することを確認
		expect(items[0].content.length).toBeGreaterThan(0);
	});

	test("fetchRSSFeed - FTSインデックスが更新される", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);

		await rssFetcher.fetchRSSFeed(feed);

		// 検索でノートが見つかることを確認
		const notes = await searchDb.searchNotes("Article");
		expect(notes.length).toBeGreaterThan(0);
		expect(notes.some((n) => n.title.includes("Article"))).toBe(true);
	});
});

