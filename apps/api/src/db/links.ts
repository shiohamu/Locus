import type { Link } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * リンクを作成する
 */
export async function createLink(link: Link): Promise<Link> {
  const db = getDb();
  await db.execute({
    sql: "INSERT OR IGNORE INTO links (from_note_id, to_note_id) VALUES (?, ?)",
    args: [link.from_note_id, link.to_note_id],
  });
  return link;
}

/**
 * ノートのリンクを取得する（双方向）
 */
export async function getLinksByNote(noteId: string): Promise<{
  outgoing: Link[];
  incoming: Link[];
}> {
  const db = getDb();

  // このノートから出るリンク
  const outgoingResult = await db.execute({
    sql: `SELECT from_note_id, to_note_id
              FROM links
              WHERE from_note_id = ?`,
    args: [noteId],
  });

  // このノートに入るリンク
  const incomingResult = await db.execute({
    sql: `SELECT from_note_id, to_note_id
              FROM links
              WHERE to_note_id = ?`,
    args: [noteId],
  });

  return {
    outgoing: outgoingResult.rows.map((row) => ({
      from_note_id: row.from_note_id as string,
      to_note_id: row.to_note_id as string,
    })),
    incoming: incomingResult.rows.map((row) => ({
      from_note_id: row.from_note_id as string,
      to_note_id: row.to_note_id as string,
    })),
  };
}

/**
 * リンクを削除する
 */
export async function deleteLink(fromNoteId: string, toNoteId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM links WHERE from_note_id = ? AND to_note_id = ?",
    args: [fromNoteId, toNoteId],
  });
}
