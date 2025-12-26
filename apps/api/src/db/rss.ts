import type { RSSFeed, RSSItem } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * RSSフィードを作成する
 */
export async function createFeed(feed: RSSFeed): Promise<RSSFeed> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO rss_feeds (id, url, title, last_fetched_at)
              VALUES (?, ?, ?, ?)`,
    args: [feed.id, feed.url, feed.title, feed.last_fetched_at ?? null],
  });
  return feed;
}

/**
 * RSSフィードを取得する
 */
export async function getFeed(id: string): Promise<RSSFeed | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, url, title, last_fetched_at FROM rss_feeds WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id as string,
    url: row.url as string,
    title: row.title as string,
    last_fetched_at: (row.last_fetched_at as number | null) ?? null,
  };
}

/**
 * RSSフィードを更新する
 */
export async function updateFeed(feed: RSSFeed): Promise<RSSFeed> {
  const db = getDb();
  await db.execute({
    sql: "UPDATE rss_feeds SET url = ?, title = ?, last_fetched_at = ? WHERE id = ?",
    args: [feed.url, feed.title, feed.last_fetched_at ?? null, feed.id],
  });
  return feed;
}

/**
 * RSSフィード一覧を取得する
 */
export async function listFeeds(): Promise<RSSFeed[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, url, title, last_fetched_at FROM rss_feeds ORDER BY title",
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    url: row.url as string,
    title: row.title as string,
    last_fetched_at: (row.last_fetched_at as number | null) ?? null,
  }));
}

/**
 * RSSアイテムを作成する
 */
export async function createItem(item: RSSItem): Promise<RSSItem> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO rss_items (note_id, feed_id, url, content, published_at)
              VALUES (?, ?, ?, ?, ?)`,
    args: [item.note_id, item.feed_id, item.url, item.content, item.published_at],
  });
  return item;
}

/**
 * RSSフィードを削除する
 */
export async function deleteFeed(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM rss_feeds WHERE id = ?",
    args: [id],
  });
}

/**
 * ノートIDに基づいてRSSアイテムを取得する
 */
export async function getItemByNoteId(noteId: string): Promise<RSSItem | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT note_id, feed_id, url, content, published_at
              FROM rss_items
              WHERE note_id = ?`,
    args: [noteId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    note_id: row.note_id as string,
    feed_id: row.feed_id as string,
    url: row.url as string,
    content: row.content as string,
    published_at: row.published_at as number,
  };
}

/**
 * フィードIDに基づいてRSSアイテム一覧を取得する
 */
export async function getItemsByFeed(feedId: string): Promise<RSSItem[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT note_id, feed_id, url, content, published_at
              FROM rss_items
              WHERE feed_id = ?
              ORDER BY published_at DESC`,
    args: [feedId],
  });

  return result.rows.map((row) => ({
    note_id: row.note_id as string,
    feed_id: row.feed_id as string,
    url: row.url as string,
    content: row.content as string,
    published_at: row.published_at as number,
  }));
}
