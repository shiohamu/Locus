import { Hono } from "hono";
import type { RSSFeed } from "@locus/shared";
import * as rssDb from "../db/rss.js";

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
 * RSSフィード取得・更新
 * POST /rss/fetch
 * TODO: RSS取得処理の実装
 */
app.post("/fetch", async (c) => {
	return c.json({ message: "Not implemented yet" }, 501);
});

export default app;


