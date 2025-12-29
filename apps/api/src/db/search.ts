import type { NoteCore } from "@locus/shared";
import { getDb } from "./db.js";
import { mapRowsToNoteCore } from "./utils/mappers.js";

/**
 * 全文検索を実行する
 * FTS5テーブルではnote_idはUNINDEXEDカラムとして保持されている
 */
export async function searchNotes(
  query: string,
  options: { limit?: number; offset?: number } = {}
): Promise<NoteCore[]> {
  const db = getDb();
  const { limit = 100, offset = 0 } = options;

  const result = await db.execute({
    sql: `SELECT nc.id, nc.type, nc.title, nc.created_at, nc.updated_at, nc.deleted_at
              FROM notes_fts
              INNER JOIN notes_core nc ON nc.id = notes_fts.note_id
              WHERE notes_fts MATCH ? AND nc.deleted_at IS NULL
              ORDER BY notes_fts.rank
              LIMIT ? OFFSET ?`,
    args: [query, limit, offset],
  });

	return mapRowsToNoteCore(result.rows);
}

/**
 * FTSインデックスを更新する
 * FTS5テーブルではUPSERTが使えないため、DELETEしてからINSERTする
 * note_idはUNINDEXEDカラムなので、WHERE句で使用可能
 */
export async function updateFTS(noteId: string, title: string, content: string): Promise<void> {
  const db = getDb();
  // 既存のエントリを削除（note_idカラムを使用）
  await db.execute({
    sql: "DELETE FROM notes_fts WHERE note_id = ?",
    args: [noteId],
  });
  // 新しいエントリを挿入
  await db.execute({
    sql: "INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)",
    args: [noteId, title, content],
  });
}
