import type { WebClip } from "@locus/shared";
import { getDb } from "./db.js";

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

  const row = result.rows[0];
  return {
    note_id: row.note_id as string,
    source_url: row.source_url as string,
    fetched_at: row.fetched_at as number,
    content: row.content as string,
  };
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

  return result.rows.map((row) => ({
    note_id: row.note_id as string,
    source_url: row.source_url as string,
    fetched_at: row.fetched_at as number,
    content: row.content as string,
  }));
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
