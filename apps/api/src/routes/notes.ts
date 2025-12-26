import type { NoteCore, NoteType } from "@locus/shared";
import { Hono } from "hono";
import * as notesDb from "../db/notes.js";

const app = new Hono();

/**
 * ノート一覧取得
 * GET /notes?type=md&limit=100&offset=0
 */
app.get("/", async (c) => {
  const type = c.req.query("type") as NoteType | undefined;
  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  const notes = await notesDb.listNotes({ type, limit, offset });
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
 * ノート取得
 * GET /notes/:id
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const note = await notesDb.getNote(id);

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
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
    return c.json({ error: "Note not found" }, 404);
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
    return c.json({ error: "Note not found" }, 404);
  }

  const deletedAt = Math.floor(Date.now() / 1000);
  await notesDb.deleteNote(id, deletedAt);
  return c.json({ message: "Note deleted" });
});

export default app;
