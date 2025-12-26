import type { NoteCore, NoteType } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * ノートを作成する
 */
export async function createNote(note: NoteCore): Promise<NoteCore> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO notes_core (id, type, title, created_at, updated_at, deleted_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      note.id,
      note.type,
      note.title,
      note.created_at,
      note.updated_at,
      note.deleted_at ?? null,
    ],
  });
  return note;
}

/**
 * ノートを取得する
 */
export async function getNote(id: string): Promise<NoteCore | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, type, title, created_at, updated_at, deleted_at
              FROM notes_core
              WHERE id = ? AND deleted_at IS NULL`,
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id as string,
    type: row.type as NoteType,
    title: row.title as string,
    created_at: row.created_at as number,
    updated_at: row.updated_at as number,
    deleted_at: (row.deleted_at as number | null) ?? null,
  };
}

/**
 * ノートを更新する
 */
export async function updateNote(note: NoteCore): Promise<NoteCore> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE notes_core
              SET type = ?, title = ?, updated_at = ?, deleted_at = ?
              WHERE id = ?`,
    args: [note.type, note.title, note.updated_at, note.deleted_at ?? null, note.id],
  });
  return note;
}

/**
 * ノートを削除する（論理削除）
 */
export async function deleteNote(id: string, deletedAt: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "UPDATE notes_core SET deleted_at = ? WHERE id = ?",
    args: [deletedAt, id],
  });
}

/**
 * ノート一覧を取得する
 */
export async function listNotes(options: {
  type?: NoteType;
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const db = getDb();
  const { type, limit = 100, offset = 0 } = options;

  let sql = `SELECT id, type, title, created_at, updated_at, deleted_at
               FROM notes_core
               WHERE deleted_at IS NULL`;
  const args: unknown[] = [];

  if (type) {
    sql += " AND type = ?";
    args.push(type);
  }

  sql += " ORDER BY updated_at DESC LIMIT ? OFFSET ?";
  args.push(limit, offset);

  const result = await db.execute({ sql, args });

  return result.rows.map((row) => ({
    id: row.id as string,
    type: row.type as NoteType,
    title: row.title as string,
    created_at: row.created_at as number,
    updated_at: row.updated_at as number,
    deleted_at: (row.deleted_at as number | null) ?? null,
  }));
}
