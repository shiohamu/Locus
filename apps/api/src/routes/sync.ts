import type { SyncPullRequest, SyncPullResponse, SyncPushRequest } from "@locus/shared";
import type { RSSItem } from "@locus/shared";
import { Hono } from "hono";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import * as rssDb from "../db/rss.js";
import * as rssItemsDb from "../db/rss.js";
import * as tagsDb from "../db/tags.js";

const app = new Hono();

/**
 * サーバーから差分取得
 * GET /sync/pull?since=1234567890
 */
app.get("/pull", async (c) => {
  const sinceParam = c.req.query("since");
  if (!sinceParam) {
    return c.json({ error: "Query parameter 'since' is required" }, 400);
  }

  const since = Number.parseInt(sinceParam, 10);
  if (Number.isNaN(since)) {
    return c.json({ error: "Invalid 'since' parameter" }, 400);
  }

  // updated_atがsinceより大きいノートを取得
  const allNotes = await notesDb.listNotes({ limit: 10000 });
  const updatedNotes = allNotes.filter((note) => note.updated_at > since);

  // ノートの詳細情報を取得
  const notesWithDetails = await Promise.all(
    updatedNotes.map(async (note) => {
      const result: SyncPullResponse["notes"][number] = {
        core: note,
      };

      if (note.type === "md") {
        const md = await notesMDDb.getNoteMD(note.id);
        if (md) {
          result.md = md;
        }
      } else if (note.type === "rss") {
        const items = await rssItemsDb.getItemsByFeed(note.id);
        if (items.length > 0) {
          result.rss = items[0];
        }
      }

      return result;
    })
  );

  // タグ、リンク、フィードも取得（簡略化のため、すべて取得）
  const tags = await tagsDb.listTags();
  const allLinks = await Promise.all(updatedNotes.map((note) => linksDb.getLinksByNote(note.id)));
  const links = allLinks.flatMap((l) => [...l.outgoing, ...l.incoming]);
  const feeds = await rssDb.listFeeds();

  const response: SyncPullResponse = {
    notes: notesWithDetails,
    tags,
    links,
    feeds,
  };

  return c.json(response);
});

/**
 * クライアントから差分送信
 * POST /sync/push
 */
app.post("/push", async (c) => {
  const body = await c.req.json<SyncPushRequest>();

  // 最終更新優先（LWW）でマージ
  for (const noteData of body.notes) {
    const existing = await notesDb.getNote(noteData.core.id);

    if (!existing || noteData.core.updated_at > existing.updated_at) {
      // ノートコアを更新
      await notesDb.createNote(noteData.core).catch(() => {
        // 既に存在する場合は更新
        return notesDb.updateNote(noteData.core);
      });

      // Markdownノートを更新
      if (noteData.md) {
        const noteMD = noteData.md;
        await notesMDDb.createNoteMD(noteMD).catch(() => {
          return notesMDDb.updateNoteMD(noteMD);
        });
      }
    }
  }

  // タグ、リンク、フィードも同様にマージ
  for (const tag of body.tags) {
    await tagsDb.createTag(tag).catch(() => {
      // 既に存在する場合は無視
    });
  }

  for (const link of body.links) {
    await linksDb.createLink(link).catch(() => {
      // 既に存在する場合は無視
    });
  }

  for (const feed of body.feeds) {
    await rssDb.createFeed(feed).catch(() => {
      // 既に存在する場合は無視
    });
  }

  return c.json({ message: "Sync completed" });
});

export default app;
