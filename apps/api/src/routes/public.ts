import { Hono } from "hono";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import * as rssDb from "../db/rss.js";
import * as tagsDb from "../db/tags.js";
import * as webClipsDb from "../db/web-clips.js";

const app = new Hono();

/**
 * 公開ノート一覧を取得
 * GET /public/notes?type=md&limit=20&offset=0
 */
app.get("/notes", async (c) => {
  try {
    const typeParam = c.req.query("type");
    const limitParam = c.req.query("limit");
    const offsetParam = c.req.query("offset");

    const type = typeParam as "md" | "rss" | "web_clip" | undefined;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

    const notes = await notesDb.listPublicNotes({ type, limit, offset });

    return c.json(notes);
  } catch (error) {
    console.error("Public notes list error:", error);
    return c.json({ error: "Failed to fetch public notes" }, 500);
  }
});

/**
 * 公開ノートを取得（詳細情報付き）
 * GET /public/notes/:id
 */
app.get("/notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const note = await notesDb.getNote(id);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // 公開設定をチェック
    if (!note.public || note.public === 0) {
      return c.json({ error: "Note is not public" }, 403);
    }

    // ノートの詳細情報を取得
    let content = null;
    let metadata: Record<string, unknown> = {};

    if (note.type === "md") {
      const noteMD = await notesMDDb.getNoteMD(note.id);
      if (noteMD) {
        content = noteMD.content;
      }
    } else if (note.type === "rss") {
      const rssItem = await rssDb.getItemByNoteId(note.id);
      if (rssItem) {
        content = rssItem.content;
        metadata = {
          url: rssItem.url,
          published_at: rssItem.published_at,
        };
      }
    } else if (note.type === "web_clip") {
      const webClip = await webClipsDb.getWebClip(note.id);
      if (webClip) {
        content = webClip.content;
        metadata = {
          source_url: webClip.source_url,
          fetched_at: webClip.fetched_at,
        };
      }
    }

    // タグを取得
    const tags = await tagsDb.getTagsByNote(note.id);

    // リンクを取得（公開ノート間のリンクのみ）
    const links = await linksDb.getLinksByNote(note.id);

    // 公開ノートのみのリンクをフィルタリング
    const outgoingPublic = await Promise.all(
      links.outgoing.map(async (link) => {
        const targetNote = await notesDb.getNote(link.to_note_id);
        return targetNote?.public === 1 ? link : null;
      })
    );

    const incomingPublic = await Promise.all(
      links.incoming.map(async (link) => {
        const sourceNote = await notesDb.getNote(link.from_note_id);
        return sourceNote?.public === 1 ? link : null;
      })
    );

    const publicLinks = {
      outgoing: outgoingPublic.filter((link): link is typeof link => link !== null),
      incoming: incomingPublic.filter((link): link is typeof link => link !== null),
    };

    return c.json({
      note,
      content,
      tags,
      links: publicLinks,
      metadata,
    });
  } catch (error) {
    console.error("Public note detail error:", error);
    return c.json({ error: "Failed to fetch public note" }, 500);
  }
});

export default app;
