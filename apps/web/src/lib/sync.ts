import type { SyncPullResponse, SyncPushRequest } from "@locus/shared";
import { syncPull, syncPush } from "./api/index.js";
import * as storage from "./storage.js";

/**
 * サーバーから差分を取得してローカルストレージに保存
 */
export async function pullSync(): Promise<{
  notes: number;
  tags: number;
  links: number;
  feeds: number;
}> {
  const lastSync = await storage.getLastSync();
  const since = lastSync ?? 0;

  const response = (await syncPull(since)) as SyncPullResponse;

  let notesCount = 0;
  let tagsCount = 0;
  let linksCount = 0;
  let feedsCount = 0;

  // ノートを保存（LWW: Last Write Wins）
  for (const noteData of response.notes) {
    const existing = await storage.getNote(noteData.core.id);
    if (!existing || noteData.core.updated_at > existing.updated_at) {
      await storage.saveNote(noteData.core);
      notesCount++;

      // Markdownノートを保存
      if (noteData.md) {
        await storage.saveNoteMD(noteData.md);
      }

      // RSSアイテムを保存
      if (noteData.rss) {
        await storage.saveRSSItem(noteData.rss);
      }
    }
  }

  // タグを保存
  for (const tag of response.tags) {
    await storage.saveTag(tag);
    tagsCount++;
  }

  // リンクを保存
  for (const link of response.links) {
    await storage.saveLink(link);
    linksCount++;
  }

  // フィードを保存
  for (const feed of response.feeds) {
    await storage.saveFeed(feed);
    feedsCount++;
  }

  // 最終同期時刻を更新
  const now = Math.floor(Date.now() / 1000);
  await storage.saveLastSync(now);

  return {
    notes: notesCount,
    tags: tagsCount,
    links: linksCount,
    feeds: feedsCount,
  };
}

/**
 * ローカルストレージから差分を取得してサーバーに送信
 */
export async function pushSync(): Promise<void> {
  const lastSync = await storage.getLastSync();
  const since = lastSync ?? 0;

  // ローカルのすべてのデータを取得
  const allNotes = await storage.getAllNotes();
  const allTags = await storage.getAllTags();
  const allLinks = await storage.getAllLinks();
  const allFeeds = await storage.getAllFeeds();

  // 更新されたノートのみをフィルタリング
  const updatedNotes = allNotes.filter((note) => note.updated_at > since);

  // ノートの詳細情報を取得
  const notesWithDetails = await Promise.all(
    updatedNotes.map(async (note) => {
      const result: SyncPushRequest["notes"][number] = {
        core: note,
      };

      if (note.type === "md") {
        const md = await storage.getNoteMD(note.id);
        if (md) {
          result.md = md;
        }
      } else if (note.type === "rss") {
        const rss = await storage.getRSSItem(note.id);
        if (rss) {
          result.rss = rss;
        }
      }

      return result;
    })
  );

  const request: SyncPushRequest = {
    notes: notesWithDetails,
    tags: allTags,
    links: allLinks,
    feeds: allFeeds,
  };

  await syncPush(request);

  // 最終同期時刻を更新
  const now = Math.floor(Date.now() / 1000);
  await storage.saveLastSync(now);
}

/**
 * 双方向同期（pull → push）
 */
export async function sync(): Promise<{
  pull: { notes: number; tags: number; links: number; feeds: number };
}> {
  const pullResult = await pullSync();
  await pushSync();
  return { pull: pullResult };
}
