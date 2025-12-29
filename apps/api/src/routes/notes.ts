import type { NoteCore, NoteType } from "@locus/shared";
import { Hono } from "hono";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import * as notesDb from "../db/notes.js";

const app = new Hono();

/**
 * ノート一覧取得
 * GET /notes?type=md&tags=tag1,tag2&limit=100&offset=0
 */
app.get("/", async (c) => {
  const type = c.req.query("type") as NoteType | undefined;
  const tagsParam = c.req.query("tags");
  const tagNames = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  let notes: NoteCore[];
  if (tagNames.length > 0) {
    notes = await notesDb.listNotesByTags({ type, tagNames, limit, offset });
  } else {
    notes = await notesDb.listNotes({ type, limit, offset });
  }
  return c.json(notes);
});

/**
 * ノート作成
 * POST /notes
 */
app.post("/", async (c) => {
  const body = await c.req.json<NoteCore>();
  const note = await notesDb.createNote(body);
  return c.json(note, 201);
});

/**
 * ノート一覧とタグ情報を一度に取得（最適化版）
 * GET /notes/with-tags?type=md&tags=tag1,tag2&limit=100&offset=0
 */
app.get("/with-tags", async (c) => {
  const type = c.req.query("type") as NoteType | undefined;
  const tagsParam = c.req.query("tags");
  const tagNames = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  const { notes, tagsMap } = await notesDb.getNotesWithTags({
    type,
    tagNames,
    limit,
    offset,
  });

  // Mapをオブジェクトに変換（JSONシリアライズ可能にする）
  const tagsMapObj: Record<string, string[]> = {};
  for (const [noteId, tags] of tagsMap.entries()) {
    tagsMapObj[noteId] = tags;
  }

  return c.json({
    notes,
    tagsMap: tagsMapObj,
  });
});

/**
 * ノート取得
 * GET /notes/:id
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const note = await notesDb.getNote(id);

  if (!note) {
    throw new NotFoundError("Note", id);
  }

  return c.json(note);
});

/**
 * ノート更新
 * PUT /notes/:id
 */
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Partial<NoteCore>>();

  const existing = await notesDb.getNote(id);
  if (!existing) {
    throw new NotFoundError("Note", id);
  }

  const updated: NoteCore = {
    ...existing,
    ...body,
    id, // IDは変更不可
    updated_at: Math.floor(Date.now() / 1000),
  };

  const note = await notesDb.updateNote(updated);
  return c.json(note);
});

/**
 * ノート削除（論理削除）
 * DELETE /notes/:id
 */
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await notesDb.getNote(id);

  if (!existing) {
    throw new NotFoundError("Note", id);
  }

  const deletedAt = Math.floor(Date.now() / 1000);
  await notesDb.deleteNote(id, deletedAt);
  return c.json({ message: "Note deleted" });
});

/**
 * ノート一括削除（論理削除）
 * DELETE /notes/batch
 * リクエストボディ: { note_ids: string[] }
 */
app.delete("/batch", async (c) => {
  try {
    const body = await c.req.json<{ note_ids: string[] }>();

    if (!body.note_ids || !Array.isArray(body.note_ids) || body.note_ids.length === 0) {
      throw new ValidationError("note_ids array is required and must not be empty");
    }

    // 存在確認（オプション：存在しないIDがあってもエラーにしない）
    const deletedAt = Math.floor(Date.now() / 1000);
    await notesDb.deleteNotesBatch(body.note_ids, deletedAt);

    return c.json({
      message: `${body.note_ids.length} notes deleted`,
      deleted_count: body.note_ids.length,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON in request body");
    }
    throw error;
  }
});

export default app;
