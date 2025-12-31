import type { NoteCore, NoteMD } from "@locus/shared";
import { Hono } from "hono";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import { updateFTS } from "../db/search.js";
import { detectNoteLinks } from "../utils/link-detector.js";

const app = new Hono();

/**
 * Markdownノート取得
 * GET /notes/md/:id
 * @param {string} id - ノートID
 * @returns {Promise<NoteMD>} Markdownノート情報
 * @throws {Error} Markdownノートが見つからない場合（404）
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const noteMD = await notesMDDb.getNoteMD(id);

  if (!noteMD) {
    return c.json({ error: "Markdown note not found" }, 404);
  }

  return c.json(noteMD);
});

/**
 * Markdownノート作成
 * POST /notes/md
 * @param {{core: NoteCore, md: NoteMD}} body - ノートコアとMarkdownノート情報
 * @returns {Promise<{core: NoteCore, md: NoteMD}>} 作成されたノート情報
 * @description ノートコア、Markdownノート、FTSインデックス、リンクを自動的に作成・更新します
 */
app.post("/", async (c) => {
  const body = await c.req.json<{
    core: NoteCore;
    md: NoteMD;
  }>();

  // ノートコアを作成
  await notesDb.createNote(body.core);

  // Markdownノートを作成
  await notesMDDb.createNoteMD(body.md);

  // FTSインデックスを更新
  await updateFTS(body.core.id, body.core.title, body.md.content);

  // リンクを検出して登録
  const linkedNoteIds = detectNoteLinks(body.md.content);
  for (const linkedNoteId of linkedNoteIds) {
    // リンク先のノートが存在するか確認
    const linkedNote = await notesDb.getNote(linkedNoteId);
    if (linkedNote) {
      await linksDb.createLink({
        from_note_id: body.core.id,
        to_note_id: linkedNoteId,
      });
    }
  }

  return c.json({ core: body.core, md: body.md }, 201);
});

/**
 * Markdownノート更新
 * PUT /notes/md/:id
 * @param {string} id - ノートID
 * @param {{core?: Partial<NoteCore>, md?: Partial<NoteMD>}} body - 更新するノート情報
 * @returns {Promise<{core: NoteCore, md: NoteMD}>} 更新されたノート情報
 * @throws {Error} ノートが見つからない場合（404）
 * @description ノートコア、Markdownノート、FTSインデックス、リンクを自動的に更新します
 */
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    core?: Partial<NoteCore>;
    md?: Partial<NoteMD>;
  }>();

  // ノートコアの更新
  if (body.core) {
    const existing = await notesDb.getNote(id);
    if (!existing) {
      return c.json({ error: "Note not found" }, 404);
    }

    const updated: NoteCore = {
      ...existing,
      ...body.core,
      id, // IDは変更不可
      updated_at: Math.floor(Date.now() / 1000),
    };
    await notesDb.updateNote(updated);
  }

  // Markdownノートの更新
  let noteMD: NoteMD | null = null;
  if (body.md) {
    const existingMD = await notesMDDb.getNoteMD(id);
    if (!existingMD) {
      return c.json({ error: "Markdown note not found" }, 404);
    }

    const updatedMD: NoteMD = {
      ...existingMD,
      ...body.md,
      note_id: id, // IDは変更不可
    };
    noteMD = await notesMDDb.updateNoteMD(updatedMD);
  } else {
    noteMD = await notesMDDb.getNoteMD(id);
  }

  // FTSインデックスを更新
  const core = await notesDb.getNote(id);
  if (core && noteMD) {
    await updateFTS(core.id, core.title, noteMD.content);

    // 既存のリンクを削除（このノートから出るリンク）
    // 注意: この実装では、既存のリンクをすべて削除して再作成する
    // より効率的な実装は、差分を計算して追加・削除を行う
    const existingLinks = await linksDb.getLinksByNote(id);
    for (const link of existingLinks.outgoing) {
      await linksDb.deleteLink(link.from_note_id, link.to_note_id);
    }

    // 新しいリンクを検出して登録
    const linkedNoteIds = detectNoteLinks(noteMD.content);
    for (const linkedNoteId of linkedNoteIds) {
      // リンク先のノートが存在するか確認
      const linkedNote = await notesDb.getNote(linkedNoteId);
      if (linkedNote) {
        await linksDb.createLink({
          from_note_id: id,
          to_note_id: linkedNoteId,
        });
      }
    }
  }

  return c.json({ core, md: noteMD });
});

export default app;
