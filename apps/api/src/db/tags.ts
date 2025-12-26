import type { NoteTag, Tag } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * タグを作成する
 */
export async function createTag(tag: Tag): Promise<Tag> {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO tags (id, name) VALUES (?, ?)",
    args: [tag.id, tag.name],
  });
  return tag;
}

/**
 * タグを取得する
 */
export async function getTag(id: string): Promise<Tag | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, name FROM tags WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
  };
}

/**
 * タグ名でタグを取得する
 */
export async function getTagByName(name: string): Promise<Tag | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, name FROM tags WHERE name = ?",
    args: [name],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
  };
}

/**
 * タグ一覧を取得する
 */
export async function listTags(): Promise<Tag[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, name FROM tags ORDER BY name",
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
  }));
}

/**
 * ノートにタグを追加する
 */
export async function addTagToNote(noteTag: NoteTag): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
    args: [noteTag.note_id, noteTag.tag_id],
  });
}

/**
 * ノートからタグを削除する
 */
export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
    args: [noteId, tagId],
  });
}

/**
 * ノートに紐づくタグ一覧を取得する
 */
export async function getTagsByNote(noteId: string): Promise<Tag[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT t.id, t.name
              FROM tags t
              INNER JOIN note_tags nt ON t.id = nt.tag_id
              WHERE nt.note_id = ?
              ORDER BY t.name`,
    args: [noteId],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
  }));
}

/**
 * タグを削除する
 * 関連するnote_tagsも削除される（外部キー制約による）
 */
export async function deleteTag(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM tags WHERE id = ?",
    args: [id],
  });
}
