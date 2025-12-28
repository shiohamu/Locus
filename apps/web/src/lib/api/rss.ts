/**
 * RSS関連API
 */

import type { RSSFeed, RSSItem } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * RSSフィード一覧取得
 */
export async function getRSSFeeds(): Promise<RSSFeed[]> {
  return apiRequest<RSSFeed[]>("/rss/feeds");
}

/**
 * RSSフィード登録
 */
export async function createRSSFeed(feed: { url: string; title: string }): Promise<RSSFeed> {
  return apiRequest<RSSFeed>("/rss/feeds", {
    method: "POST",
    body: JSON.stringify(feed),
  });
}

/**
 * RSSフィード削除
 */
export async function deleteRSSFeed(feedId: string): Promise<void> {
  return apiRequest<void>(`/rss/feeds/${feedId}`, {
    method: "DELETE",
  });
}

/**
 * RSSフィード取得・更新
 */
export async function fetchRSSFeed(feedId?: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/rss/fetch", {
    method: "POST",
    body: JSON.stringify(feedId ? { feed_id: feedId } : {}),
  });
}

/**
 * RSSアイテム取得（ノートIDで取得）
 */
export async function getRSSItem(noteId: string): Promise<RSSItem> {
  return apiRequest<RSSItem>(`/rss/items/${noteId}`);
}
