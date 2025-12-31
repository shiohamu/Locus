import type { WebClip } from "@locus/shared";
import { getDb } from "./db.js";
import { mapRowToWebClip, mapRowsToWebClip } from "./utils/mappers.js";

/**
 * Webクリップを作成する
 */
export async function createWebClip(webClip: WebClip): Promise<WebClip> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO web_clips (note_id, source_url, fetched_at, content)
              VALUES (?, ?, ?, ?)`,
    args: [webClip.note_id, webClip.source_url, webClip.fetched_at, webClip.content],
  });
  return webClip;
}

/**
 * Webクリップを取得する
 */
export async function getWebClip(noteId: string): Promise<WebClip | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT note_id, source_url, fetched_at, content FROM web_clips WHERE note_id = ?",
    args: [noteId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToWebClip(result.rows[0]);
}

/**
 * Webクリップを更新する
 */
export async function updateWebClip(webClip: WebClip): Promise<WebClip> {
  const db = getDb();
  await db.execute({
    sql: "UPDATE web_clips SET source_url = ?, fetched_at = ?, content = ? WHERE note_id = ?",
    args: [webClip.source_url, webClip.fetched_at, webClip.content, webClip.note_id],
  });
  return webClip;
}

/**
 * Webクリップ一覧を取得する
 */
export async function listWebClips(options?: {
  limit?: number;
  offset?: number;
}): Promise<WebClip[]> {
  const db = getDb();
  const { limit = 100, offset = 0 } = options || {};

  const result = await db.execute({
    sql: `SELECT note_id, source_url, fetched_at, content
              FROM web_clips
              ORDER BY fetched_at DESC
              LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });

  return mapRowsToWebClip(result.rows);
}

/**
 * Webクリップを削除する
 */
export async function deleteWebClip(noteId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM web_clips WHERE note_id = ?",
    args: [noteId],
  });
}
