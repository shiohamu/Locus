import type { NoteCore, NoteType } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * ノートを作成する
 */
export async function createNote(note: NoteCore): Promise<NoteCore> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO notes_core (id, type, title, created_at, updated_at, deleted_at, public)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      note.id,
      note.type,
      note.title,
      note.created_at,
      note.updated_at,
      note.deleted_at ?? null,
      note.public ?? 0,
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
    sql: `SELECT id, type, title, created_at, updated_at, deleted_at, public
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
    public: (row.public as number | undefined) ?? 0,
  };
}

/**
 * ノートを更新する
 */
export async function updateNote(note: NoteCore): Promise<NoteCore> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE notes_core
              SET type = ?, title = ?, updated_at = ?, deleted_at = ?, public = ?
              WHERE id = ?`,
    args: [
      note.type,
      note.title,
      note.updated_at,
      note.deleted_at ?? null,
      note.public ?? 0,
      note.id,
    ],
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

  let sql = `SELECT id, type, title, created_at, updated_at, deleted_at, public
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
    public: (row.public as number | undefined) ?? 0,
  }));
}

/**
 * タグでフィルタリングされたノート一覧を取得する
 * 複数のタグが指定された場合はOR条件（いずれかのタグが含まれている）
 */
export async function listNotesByTags(options: {
  type?: NoteType;
  tagNames: string[];
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const db = getDb();
  const { type, tagNames, limit = 100, offset = 0 } = options;

  if (tagNames.length === 0) {
    return listNotes({ type, limit, offset });
  }

  // いずれかの指定されたタグが含まれているノートを取得（OR条件）
  // DISTINCTを使用して重複を除去
  let sql = `SELECT DISTINCT nc.id, nc.type, nc.title, nc.created_at, nc.updated_at, nc.deleted_at, nc.public
               FROM notes_core nc
               INNER JOIN note_tags nt ON nc.id = nt.note_id
               INNER JOIN tags t ON nt.tag_id = t.id
               WHERE nc.deleted_at IS NULL
                 AND t.name IN (${tagNames.map(() => "?").join(", ")})`;

  const args: unknown[] = [...tagNames];

  if (type) {
    sql += " AND nc.type = ?";
    args.push(type);
  }

  sql += " ORDER BY nc.updated_at DESC LIMIT ? OFFSET ?";
  args.push(limit, offset);

  const result = await db.execute({ sql, args });

  return result.rows.map((row) => ({
    id: row.id as string,
    type: row.type as NoteType,
    title: row.title as string,
    created_at: row.created_at as number,
    updated_at: row.updated_at as number,
    deleted_at: (row.deleted_at as number | null) ?? null,
    public: (row.public as number | undefined) ?? 0,
  }));
}

/**
 * 公開ノート一覧を取得する
 */
export async function listPublicNotes(options: {
  type?: NoteType;
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const db = getDb();
  const { type, limit = 100, offset = 0 } = options;

  let sql = `SELECT id, type, title, created_at, updated_at, deleted_at, public
               FROM notes_core
               WHERE deleted_at IS NULL AND public = 1`;
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
    public: (row.public as number | undefined) ?? 1,
  }));
}
