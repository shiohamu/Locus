import type { NoteTag, Tag } from "@locus/shared";
import { getDb } from "./db.js";
import { mapRowToTag, mapRowsToTag } from "./utils/mappers.js";
import { createQueryBuilder } from "./utils/query-builder.js";

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

  return mapRowToTag(result.rows[0]);
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

  return mapRowToTag(result.rows[0]);
}

/**
 * タグ一覧を取得する
 */
export async function listTags(): Promise<Tag[]> {
  const db = getDb();
  const query = createQueryBuilder().select(["id", "name"]).from("tags").orderBy("name", "ASC");

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToTag(result.rows);
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
  const query = createQueryBuilder()
    .select(["t.id", "t.name"])
    .from("tags", "t")
    .join("note_tags", "nt", "t.id = nt.tag_id")
    .where("nt.note_id = ?", noteId)
    .orderBy("t.name", "ASC");

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToTag(result.rows);
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
