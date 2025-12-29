import type { RSSFeed, RSSItem } from "@locus/shared";
import { DatabaseError } from "../utils/errors.js";
import { getDb } from "./db.js";
import {
	mapRowToRSSFeed,
	mapRowToRSSItem,
	mapRowsToRSSFeed,
	mapRowsToRSSItem,
} from "./utils/mappers.js";
import { handleDbOperation, handleDbOperationNullable } from "./utils/error-handler.js";

/**
 * RSSフィードを作成する
 */
export async function createFeed(feed: RSSFeed): Promise<RSSFeed> {
	return handleDbOperation(`createFeed(${feed.id})`, async () => {
		const db = getDb();
		await db.execute({
			sql: `INSERT INTO rss_feeds (id, url, title, last_fetched_at)
              VALUES (?, ?, ?, ?)`,
			args: [feed.id, feed.url, feed.title, feed.last_fetched_at ?? null],
		});
		return feed;
	});
}

/**
 * RSSフィードを取得する
 */
export async function getFeed(id: string): Promise<RSSFeed | null> {
	return handleDbOperationNullable(`getFeed(${id})`, async () => {
		const db = getDb();
		const result = await db.execute({
			sql: "SELECT id, url, title, last_fetched_at FROM rss_feeds WHERE id = ?",
			args: [id],
		});

		if (result.rows.length === 0) {
			return null;
		}

		return mapRowToRSSFeed(result.rows[0]);
	});
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

	return mapRowsToRSSFeed(result.rows);
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

	return mapRowToRSSItem(result.rows[0]);
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

	return mapRowsToRSSItem(result.rows);
}

/**
 * RSSアイテムのコンテンツを更新する
 */
export async function updateItem(noteId: string, content: string): Promise<RSSItem> {
	return handleDbOperation(`updateItem(${noteId})`, async () => {
		const db = getDb();
		await db.execute({
			sql: "UPDATE rss_items SET content = ? WHERE note_id = ?",
			args: [content, noteId],
		});

		const updated = await getItemByNoteId(noteId);
		if (!updated) {
			throw new DatabaseError("Failed to update RSS item", { noteId });
		}

		return updated;
	});
}
