import { Hono } from "hono";
import type { RSSFeed } from "@locus/shared";
import * as rssDb from "../db/rss.js";
import { fetchRSSFeed } from "../services/rss-fetcher.js";

const app = new Hono();

/**
 * RSSフィード登録
 * POST /rss/feeds
 */
app.post("/feeds", async (c) => {
	const body = await c.req.json<Omit<RSSFeed, "id" | "last_fetched_at"> & {
		id?: string;
	}>();
	const id = body.id ?? crypto.randomUUID();
	const feed: RSSFeed = {
		id,
		url: body.url,
		title: body.title,
		last_fetched_at: null,
	};

	const created = await rssDb.createFeed(feed);
	return c.json(created, 201);
});

/**
 * RSSフィード一覧取得
 * GET /rss/feeds
 */
app.get("/feeds", async (c) => {
	const feeds = await rssDb.listFeeds();
	return c.json(feeds);
});

/**
 * RSSフィード削除
 * DELETE /rss/feeds/:id
 */
app.delete("/feeds/:id", async (c) => {
	const id = c.req.param("id");
	await rssDb.deleteFeed(id);
	return c.json({ message: "Feed deleted" });
});

/**
 * RSSアイテム取得（ノートIDで取得）
 * GET /rss/items/:noteId
 */
app.get("/items/:noteId", async (c) => {
	const noteId = c.req.param("noteId");
	const item = await rssDb.getItemByNoteId(noteId);
	if (!item) {
		return c.json({ error: "RSS item not found" }, 404);
	}
	return c.json(item);
});

/**
 * RSSフィード取得・更新
 * POST /rss/fetch
 * リクエストボディ: { feed_id?: string }
 * feed_idが指定されない場合は、すべてのフィードを更新
 */
app.post("/fetch", async (c) => {
	const body = await c.req.json<{ feed_id?: string }>().catch(() => ({}));

	if (body.feed_id) {
		// 特定のフィードを更新
		const feed = await rssDb.getFeed(body.feed_id);
		if (!feed) {
			return c.json({ error: "Feed not found" }, 404);
		}

		try {
			const result = await fetchRSSFeed(feed);
			return c.json(result);
		} catch (error) {
			return c.json(
				{
					error: error instanceof Error ? error.message : "Failed to fetch RSS feed",
				},
				500,
			);
		}
	} else {
		// すべてのフィードを更新
		const feeds = await rssDb.listFeeds();
		const results = await Promise.allSettled(
			feeds.map((feed) => fetchRSSFeed(feed)),
		);

		const summary = {
			total: feeds.length,
			success: results.filter((r) => r.status === "fulfilled").length,
			failed: results.filter((r) => r.status === "rejected").length,
		};

		return c.json(summary);
	}
});

export default app;



