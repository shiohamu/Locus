import type { File, FileNote } from "@locus/shared";
import { getDb } from "./db.js";

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

  const row = result.rows[0];
  return {
    id: row.id as string,
    filename: row.filename as string,
    mime_type: row.mime_type as string,
    size: row.size as number,
    created_at: row.created_at as number,
    show_in_notes: (row.show_in_notes as number | null) === 1,
  };
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

  const result = await db.execute({
    sql: `SELECT id, filename, mime_type, size, created_at, show_in_notes
              FROM files
              ORDER BY created_at DESC
              LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    filename: row.filename as string,
    mime_type: row.mime_type as string,
    size: row.size as number,
    created_at: row.created_at as number,
    show_in_notes: (row.show_in_notes as number | null) === 1,
  }));
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
  const result = await db.execute({
    sql: `SELECT f.id, f.filename, f.mime_type, f.size, f.created_at, f.show_in_notes
              FROM files f
              INNER JOIN file_notes fn ON f.id = fn.file_id
              WHERE fn.note_id = ?
              ORDER BY f.created_at DESC`,
    args: [noteId],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    filename: row.filename as string,
    mime_type: row.mime_type as string,
    size: row.size as number,
    created_at: row.created_at as number,
    show_in_notes: (row.show_in_notes as number | null) === 1,
  }));
}

/**
 * ファイルを更新する
 */
export async function updateFile(id: string, updates: Partial<File>): Promise<File> {
  const db = getDb();
  const existing = await getFile(id);
  if (!existing) {
    throw new Error("File not found");
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
  const result = await db.execute({
    sql: `SELECT id, filename, mime_type, size, created_at, show_in_notes
              FROM files
              WHERE show_in_notes = 1
              ORDER BY created_at DESC`,
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    filename: row.filename as string,
    mime_type: row.mime_type as string,
    size: row.size as number,
    created_at: row.created_at as number,
    show_in_notes: (row.show_in_notes as number | null) === 1,
  }));
}
