import type { NoteMD } from "@locus/shared";
import { getDb } from "./db.js";
import { mapRowToNoteMD } from "./utils/mappers.js";

/**
 * Markdownノートを作成する
 */
export async function createNoteMD(noteMD: NoteMD): Promise<NoteMD> {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO notes_md (note_id, content) VALUES (?, ?)",
    args: [noteMD.note_id, noteMD.content],
  });
  return noteMD;
}

/**
 * Markdownノートを取得する
 */
export async function getNoteMD(noteId: string): Promise<NoteMD | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT note_id, content FROM notes_md WHERE note_id = ?",
    args: [noteId],
  });

	if (result.rows.length === 0) {
		return null;
	}

	return mapRowToNoteMD(result.rows[0]);
}

/**
 * Markdownノートを更新する
 */
export async function updateNoteMD(noteMD: NoteMD): Promise<NoteMD> {
  const db = getDb();
  await db.execute({
    sql: "UPDATE notes_md SET content = ? WHERE note_id = ?",
    args: [noteMD.content, noteMD.note_id],
  });
  return noteMD;
}
