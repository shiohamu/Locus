import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore, createTestRSSFeed } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import * as rssDb from "./rss.js";
import * as notesDb from "./notes.js";
import type { RSSItem } from "@locus/shared";

describe("rss", () => {
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
	});

	test("createFeed - RSSフィードを作成できる", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		const created = await rssDb.createFeed(feed);
		expect(created).toEqual(feed);
	});

	test("getFeed - RSSフィードを取得できる", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);
		const retrieved = await rssDb.getFeed(feed.id);

		expect(retrieved).not.toBeNull();
		expect(retrieved?.id).toBe(feed.id);
		expect(retrieved?.url).toBe(feed.url);
		expect(retrieved?.title).toBe(feed.title);
	});

	test("updateFeed - RSSフィードを更新できる", async () => {
		const feed = createTestRSSFeed({
			url: "https://example.com/feed.xml",
			title: "Test Feed",
		});

		await rssDb.createFeed(feed);

		const updated = {
			...feed,
			title: "Updated Feed",
			last_fetched_at: Math.floor(Date.now() / 1000),
		};

		const result = await rssDb.updateFeed(updated);
		expect(result.title).toBe("Updated Feed");
		expect(result.last_fetched_at).not.toBeNull();

		const retrieved = await rssDb.getFeed(feed.id);
		expect(retrieved?.title).toBe("Updated Feed");
	});

	test("listFeeds - RSSフィード一覧を取得できる", async () => {
		const feed1 = createTestRSSFeed({
			url: "https://example.com/feed1.xml",
			title: "Feed 1",
		});
		const feed2 = createTestRSSFeed({
			url: "https://example.com/feed2.xml",
			title: "Feed 2",
		});

		await rssDb.createFeed(feed1);
		await rssDb.createFeed(feed2);

		const feeds = await rssDb.listFeeds();
		expect(feeds.length).toBe(2);
		expect(feeds.map((f) => f.id)).toContain(feed1.id);
		expect(feeds.map((f) => f.id)).toContain(feed2.id);
	});

	test("createItem - RSSアイテムを作成できる", async () => {
		const feed = createTestRSSFeed();
		const note = createTestNoteCore({
			type: "rss",
			title: "RSS Article",
		});

		await rssDb.createFeed(feed);
		await notesDb.createNote(note);

		const item: RSSItem = {
			note_id: note.id,
			feed_id: feed.id,
			url: "https://example.com/article",
			content: "Article content",
			published_at: Math.floor(Date.now() / 1000),
		};

		const created = await rssDb.createItem(item);
		expect(created).toEqual(item);
	});

	test("getItemByNoteId - ノートIDでRSSアイテムを取得できる", async () => {
		const feed = createTestRSSFeed();
		const note = createTestNoteCore({
			type: "rss",
			title: "RSS Article",
		});

		await rssDb.createFeed(feed);
		await notesDb.createNote(note);

		const item: RSSItem = {
			note_id: note.id,
			feed_id: feed.id,
			url: "https://example.com/article",
			content: "Article content",
			published_at: Math.floor(Date.now() / 1000),
		};

		await rssDb.createItem(item);

		const retrieved = await rssDb.getItemByNoteId(note.id);
		expect(retrieved).not.toBeNull();
		expect(retrieved?.note_id).toBe(note.id);
		expect(retrieved?.url).toBe(item.url);
	});

	test("getItemsByFeed - フィードIDでRSSアイテム一覧を取得できる", async () => {
		const feed = createTestRSSFeed();
		const note1 = createTestNoteCore({
			type: "rss",
			title: "Article 1",
		});
		const note2 = createTestNoteCore({
			type: "rss",
			title: "Article 2",
		});

		await rssDb.createFeed(feed);
		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		const item1: RSSItem = {
			note_id: note1.id,
			feed_id: feed.id,
			url: "https://example.com/article1",
			content: "Content 1",
			published_at: Math.floor(Date.now() / 1000),
		};

		const item2: RSSItem = {
			note_id: note2.id,
			feed_id: feed.id,
			url: "https://example.com/article2",
			content: "Content 2",
			published_at: Math.floor(Date.now() / 1000) + 1,
		};

		await rssDb.createItem(item1);
		await rssDb.createItem(item2);

		const items = await rssDb.getItemsByFeed(feed.id);
		expect(items.length).toBe(2);
		expect(items.map((i) => i.note_id)).toContain(note1.id);
		expect(items.map((i) => i.note_id)).toContain(note2.id);
	});

	test("deleteFeed - RSSフィードを削除できる", async () => {
		const feed = createTestRSSFeed();

		await rssDb.createFeed(feed);
		await rssDb.deleteFeed(feed.id);

		const retrieved = await rssDb.getFeed(feed.id);
		expect(retrieved).toBeNull();
	});
});

