import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import * as rssDb from "../db/rss.js";
import { app } from "../index.js";
import {
	cleanupTestDbFile,
	createTestDbFile,
	createTestRSSFeed,
} from "../test/helpers.js";

describe("rss API", () => {
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
			process.env.DATABASE_URL = undefined;
		}

		await cleanupTestDbFile(testDb, dbPath);
	});

	test("POST /rss/feeds - RSSフィードを登録できる", async () => {
		const res = await app.request("/rss/feeds", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				url: "https://example.com/feed",
				title: "Test Feed",
			}),
		});

		expect(res.status).toBe(201);

		const body = await res.json();
		expect(body.url).toBe("https://example.com/feed");
		expect(body.title).toBe("Test Feed");
		expect(body.id).toBeDefined();
	});

	test("POST /rss/feeds - IDを指定して登録できる", async () => {
		const customId = "custom-feed-id";
		const res = await app.request("/rss/feeds", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: customId,
				url: "https://example.com/feed",
				title: "Test Feed",
			}),
		});

		expect(res.status).toBe(201);

		const body = await res.json();
		expect(body.id).toBe(customId);
	});

	test("GET /rss/feeds - RSSフィード一覧を取得できる", async () => {
		const feed1 = createTestRSSFeed({ url: "https://example.com/feed1" });
		const feed2 = createTestRSSFeed({ url: "https://example.com/feed2" });
		await rssDb.createFeed(feed1);
		await rssDb.createFeed(feed2);

		const res = await app.request("/rss/feeds");
		expect(res.status).toBe(200);

		const feeds = await res.json();
		expect(Array.isArray(feeds)).toBe(true);
		expect(feeds.length).toBe(2);
	});

	test("DELETE /rss/feeds/:id - RSSフィードを削除できる", async () => {
		const feed = createTestRSSFeed();
		await rssDb.createFeed(feed);

		const res = await app.request(`/rss/feeds/${feed.id}`, {
			method: "DELETE",
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.message).toBe("Feed deleted");

		// フィードが削除されたことを確認
		const deleted = await rssDb.getFeed(feed.id);
		expect(deleted).toBeNull();
	});

	test("GET /rss/items/:noteId - RSSアイテムを取得できる", async () => {
		const feed = createTestRSSFeed();
		await rssDb.createFeed(feed);

		const { createNote } = await import("../db/notes.js");
		const note = await createNote({
			id: "test-note-id",
			type: "rss",
			title: "RSS Note",
			created_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
			deleted_at: null,
			public: 0,
		});

		const item = await rssDb.createItem({
			note_id: note.id,
			feed_id: feed.id,
			url: "https://example.com/item",
			content: "Item content",
			published_at: Math.floor(Date.now() / 1000),
		});

		const res = await app.request(`/rss/items/${note.id}`);
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.note_id).toBe(note.id);
		expect(body.content).toBe("Item content");
	});

	test("GET /rss/items/:noteId - 存在しないアイテムは404を返す", async () => {
		const res = await app.request("/rss/items/non-existent-id");
		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("RSS item not found");
	});

	test("PUT /rss/items/:noteId - RSSアイテムのコンテンツを更新できる", async () => {
		const feed = createTestRSSFeed();
		await rssDb.createFeed(feed);

		const { createNote } = await import("../db/notes.js");
		const note = await createNote({
			id: "test-note-id",
			type: "rss",
			title: "RSS Note",
			created_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
			deleted_at: null,
			public: 0,
		});

		await rssDb.createItem({
			note_id: note.id,
			feed_id: feed.id,
			url: "https://example.com/item",
			content: "Original content",
			published_at: Math.floor(Date.now() / 1000),
		});

		const res = await app.request(`/rss/items/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: "Updated content" }),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.content).toBe("Updated content");
	});

	test("PUT /rss/items/:noteId - contentが必須", async () => {
		const res = await app.request("/rss/items/test-note-id", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		expect(res.status).toBe(400);

		const body = await res.json();
		expect(body.error).toBe("content is required");
	});

	test("PUT /rss/items/:noteId - 存在しないアイテムは404を返す", async () => {
		const res = await app.request("/rss/items/non-existent-id", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: "Updated content" }),
		});

		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("RSS item not found");
	});
});

