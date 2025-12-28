import type { NoteTag, Tag } from "@locus/shared";
import { Hono } from "hono";
import * as notesDb from "../db/notes.js";
import * as notesMdDb from "../db/notes_md.js";
import * as rssDb from "../db/rss.js";
import * as tagsDb from "../db/tags.js";
import * as webClipsDb from "../db/web-clips.js";
import { createLLMProvider, getLLMConfig } from "../services/llm/factory.js";
import { TagSuggestionService } from "../services/tag-suggestions.js";

const app = new Hono();

/**
 * ノートに紐づくタグ一覧取得
 * GET /notes/:id/tags
 */
app.get("/:id/tags", async (c) => {
  const noteId = c.req.param("id");
  const tags = await tagsDb.getTagsByNote(noteId);
  return c.json(tags);
});

/**
 * ノートにタグ追加
 * POST /notes/:id/tags
 */
app.post("/:id/tags", async (c) => {
  const noteId = c.req.param("id");
  const body = await c.req.json<{ tag_id: string }>();

  const noteTag: NoteTag = {
    note_id: noteId,
    tag_id: body.tag_id,
  };

  await tagsDb.addTagToNote(noteTag);
  return c.json({ message: "Tag added to note" }, 201);
});

/**
 * ノートからタグ削除
 * DELETE /notes/:id/tags/:tag
 */
app.delete("/:id/tags/:tag", async (c) => {
  const noteId = c.req.param("id");
  const tagId = c.req.param("tag");

  await tagsDb.removeTagFromNote(noteId, tagId);
  return c.json({ message: "Tag removed from note" });
});

/**
 * タグ候補生成
 * POST /notes/:id/tags/suggestions
 */
app.post("/:id/tags/suggestions", async (c) => {
  try {
    const noteId = c.req.param("id");
    const note = await notesDb.getNote(noteId);
    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // ノートのコンテンツを取得
    let content = "";
    if (note.type === "md") {
      const noteMd = await notesMdDb.getNoteMD(noteId);
      if (noteMd) {
        content = noteMd.content;
      }
    } else if (note.type === "rss") {
      const rssItem = await rssDb.getItemByNoteId(noteId);
      if (rssItem) {
        content = rssItem.content;
      }
    } else if (note.type === "web_clip") {
      const webClip = await webClipsDb.getWebClip(noteId);
      if (webClip) {
        content = webClip.content;
      }
    }

    if (!content) {
      return c.json({ error: "Note content not found" }, 404);
    }

    // 既存のタグを取得
    const existingTags = await tagsDb.getTagsByNote(noteId);

    // LLMプロバイダーを取得（利用可能な場合）
    let llmProvider = null;
    try {
      const config = await getLLMConfig();
      if (config) {
        llmProvider = createLLMProvider(config);
      }
    } catch {
      // LLMが設定されていない場合はルールベースのみ使用
    }

    // タグ候補を生成
    const tagSuggestionService = new TagSuggestionService(llmProvider);
    const suggestions = await tagSuggestionService.generateSuggestions(
      note.title,
      content,
      existingTags
    );

    return c.json({ suggestions });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
