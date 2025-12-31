import type { RSSFeed } from "@locus/shared";
import { Hono } from "hono";
import * as rssDb from "../db/rss.js";
import { fetchRSSFeed } from "../services/rss-fetcher.js";

const app = new Hono();

/**
 * RSSフィード登録
 * POST /rss/feeds
 * @param {Omit<RSSFeed, 'id' | 'last_fetched_at'> & {id?: string}} body - RSSフィード情報
 * @returns {Promise<RSSFeed>} 作成されたRSSフィード
 */
app.post("/feeds", async (c) => {
  const body = await c.req.json<
    Omit<RSSFeed, "id" | "last_fetched_at"> & {
      id?: string;
    }
  >();
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
 * @returns {Promise<RSSFeed[]>} RSSフィード一覧
 */
app.get("/feeds", async (c) => {
  const feeds = await rssDb.listFeeds();
  return c.json(feeds);
});

/**
 * RSSフィード削除
 * DELETE /rss/feeds/:id
 * @param {string} id - RSSフィードID
 * @returns {Promise<{message: string}>} 削除成功メッセージ
 */
app.delete("/feeds/:id", async (c) => {
  const id = c.req.param("id");
  await rssDb.deleteFeed(id);
  return c.json({ message: "Feed deleted" });
});

/**
 * RSSアイテム取得（ノートIDで取得）
 * GET /rss/items/:noteId
 * @param {string} noteId - ノートID
 * @returns {Promise<RSSItem>} RSSアイテム情報
 * @throws {Error} RSSアイテムが見つからない場合（404）
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
 * @param {{feed_id?: string}} [body] - フィードID（指定しない場合はすべてのフィードを更新）
 * @returns {Promise<{created: number, updated: number}> | {total: number, success: number, failed: number}} 取得結果
 * @throws {Error} フィードが見つからない場合、取得に失敗した場合
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
        500
      );
    }
  } else {
    // すべてのフィードを更新
    const feeds = await rssDb.listFeeds();
    const results = await Promise.allSettled(feeds.map((feed) => fetchRSSFeed(feed)));

    const summary = {
      total: feeds.length,
      success: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return c.json(summary);
  }
});

/**
 * RSSアイテムのコンテンツを更新
 * PUT /rss/items/:noteId
 * @param {string} noteId - ノートID
 * @param {{content: string}} body - 更新するコンテンツ
 * @returns {Promise<RSSItem>} 更新されたRSSアイテム
 * @throws {Error} コンテンツが指定されていない場合、RSSアイテムが見つからない場合
 */
app.put("/items/:noteId", async (c) => {
  const noteId = c.req.param("noteId");
  const body = await c.req.json<{ content: string }>();

  if (!body.content) {
    return c.json({ error: "content is required" }, 400);
  }

  const existingItem = await rssDb.getItemByNoteId(noteId);
  if (!existingItem) {
    return c.json({ error: "RSS item not found" }, 404);
  }

  try {
    const updated = await rssDb.updateItem(noteId, body.content);
    return c.json(updated);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to update RSS item",
      },
      500
    );
  }
});

export default app;
