import type { File, FileNote } from "@locus/shared";
import { NotFoundError, DatabaseError } from "../utils/errors.js";
import { getDb } from "./db.js";
import { mapRowToFile, mapRowsToFile } from "./utils/mappers.js";
import { createQueryBuilder } from "./utils/query-builder.js";

/**
 * ファイルを作成する
 */
export async function createFile(file: File): Promise<File> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO files (id, filename, mime_type, size, created_at, show_in_notes)
              VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      file.id,
      file.filename,
      file.mime_type,
      file.size,
      file.created_at,
      file.show_in_notes ? 1 : 0,
    ],
  });
  return file;
}

/**
 * ファイルを取得する
 */
export async function getFile(id: string): Promise<File | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, filename, mime_type, size, created_at, show_in_notes FROM files WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToFile(result.rows[0]);
}

/**
 * ファイル一覧を取得する
 */
export async function listFiles(options?: {
  limit?: number;
  offset?: number;
}): Promise<File[]> {
  const db = getDb();
  const { limit = 100, offset = 0 } = options || {};

  const query = createQueryBuilder()
    .select(["id", "filename", "mime_type", "size", "created_at", "show_in_notes"])
    .from("files")
    .orderBy("created_at", "DESC")
    .limit(limit, offset);

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToFile(result.rows);
}

/**
 * ファイルを削除する
 */
export async function deleteFile(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM files WHERE id = ?",
    args: [id],
  });
}

/**
 * ノートとファイルを関連付ける
 */
export async function linkFileToNote(fileId: string, noteId: string): Promise<FileNote> {
  const db = getDb();
  const fileNote: FileNote = {
    file_id: fileId,
    note_id: noteId,
  };

  await db.execute({
    sql: `INSERT INTO file_notes (file_id, note_id)
              VALUES (?, ?)`,
    args: [fileId, noteId],
  });

  return fileNote;
}

/**
 * ノートとファイルの関連を解除する
 */
export async function unlinkFileFromNote(fileId: string, noteId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM file_notes WHERE file_id = ? AND note_id = ?",
    args: [fileId, noteId],
  });
}

/**
 * ノートに紐づくファイル一覧を取得する
 */
export async function getFilesByNote(noteId: string): Promise<File[]> {
  const db = getDb();
  const query = createQueryBuilder()
    .select(["f.id", "f.filename", "f.mime_type", "f.size", "f.created_at", "f.show_in_notes"])
    .from("files", "f")
    .join("file_notes", "fn", "f.id = fn.file_id")
    .where("fn.note_id = ?", noteId)
    .orderBy("f.created_at", "DESC");

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToFile(result.rows);
}

/**
 * ファイルを更新する
 */
export async function updateFile(id: string, updates: Partial<File>): Promise<File> {
  const db = getDb();
  const existing = await getFile(id);
  if (!existing) {
    throw new NotFoundError("File", id);
  }

  const updated: File = {
    ...existing,
    ...updates,
    id, // IDは変更不可
  };

  await db.execute({
    sql: `UPDATE files SET filename = ?, mime_type = ?, size = ?, created_at = ?, show_in_notes = ?
              WHERE id = ?`,
    args: [
      updated.filename,
      updated.mime_type,
      updated.size,
      updated.created_at,
      updated.show_in_notes ? 1 : 0,
      id,
    ],
  });

  return updated;
}

/**
 * ファイルに紐づくノートID一覧を取得する
 */
export async function getNoteIdsByFile(fileId: string): Promise<string[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT note_id FROM file_notes WHERE file_id = ?",
    args: [fileId],
  });

  return result.rows.map((row) => row.note_id as string);
}

/**
 * ノート一覧に表示するファイル一覧を取得する
 */
export async function listFilesForNotes(): Promise<File[]> {
  const db = getDb();
  const query = createQueryBuilder()
    .select(["id", "filename", "mime_type", "size", "created_at", "show_in_notes"])
    .from("files")
    .where("show_in_notes = ?", 1)
    .orderBy("created_at", "DESC");

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToFile(result.rows);
}
