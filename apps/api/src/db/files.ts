import type { File, FileNote } from "@locus/shared";
import { DatabaseError, NotFoundError } from "../utils/errors.js";
import { getDb } from "./db.js";
import { handleDbOperation, handleDbOperationNullable } from "./utils/error-handler.js";
import { mapRowToFile, mapRowsToFile } from "./utils/mappers.js";
import { createQueryBuilder } from "./utils/query-builder.js";
import { assertString } from "./utils/validators.js";

/**
 * ファイルを作成する
 * @param file - 作成するファイルの情報（id, filename, mime_type, size, created_at, show_in_notesを含む）
 * @returns 作成されたファイル（入力と同じ）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function createFile(file: File): Promise<File> {
  return handleDbOperation(`createFile(${file.id})`, async () => {
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
  });
}

/**
 * ファイルを取得する
 * @param id - 取得するファイルのID
 * @returns ファイルが見つかった場合はFile、見つからない場合はnull
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function getFile(id: string): Promise<File | null> {
  return handleDbOperationNullable(`getFile(${id})`, async () => {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT id, filename, mime_type, size, created_at, show_in_notes FROM files WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToFile(result.rows[0]);
  });
}

/**
 * ファイル一覧を取得する
 * @param options - 取得オプション
 * @param options.limit - 取得件数の上限（デフォルト: 100）
 * @param options.offset - 取得開始位置（デフォルト: 0）
 * @returns ファイル一覧（created_atの降順でソート）
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
 * ファイルを削除する（物理削除）
 * @param id - 削除するファイルのID
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
 * @param fileId - 関連付けるファイルのID
 * @param noteId - 関連付けるノートのID
 * @returns 作成された関連付け情報
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
 * @param fileId - 関連を解除するファイルのID
 * @param noteId - 関連を解除するノートのID
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
 * @param noteId - ノートのID
 * @returns ノートに紐づくファイル一覧（created_atの降順でソート）
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
 * @param id - 更新するファイルのID
 * @param updates - 更新するフィールド（filename, mime_type, size, created_at, show_in_notes）
 * @returns 更新されたファイル
 * @throws NotFoundError ファイルが見つからない場合
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function updateFile(id: string, updates: Partial<File>): Promise<File> {
  return handleDbOperation(`updateFile(${id})`, async () => {
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
  });
}

/**
 * ファイルに紐づくノートID一覧を取得する
 * @param fileId - ファイルのID
 * @returns ファイルに紐づくノートIDの配列
 */
export async function getNoteIdsByFile(fileId: string): Promise<string[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT note_id FROM file_notes WHERE file_id = ?",
    args: [fileId],
  });

  return result.rows.map((row) => assertString(row.note_id, "note_id"));
}

/**
 * ノート一覧に表示するファイル一覧を取得する（show_in_notes = 1のファイルのみ）
 * @returns ノート一覧に表示するファイル一覧（created_atの降順でソート）
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
