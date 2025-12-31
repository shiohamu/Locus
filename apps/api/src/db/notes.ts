import type { NoteCore, NoteType } from "@locus/shared";
import { getDb } from "./db.js";
import { handleDbOperation, handleDbOperationNullable } from "./utils/error-handler.js";
import { mapRowToNoteCore, mapRowsToNoteCore } from "./utils/mappers.js";
import { createQueryBuilder } from "./utils/query-builder.js";
import { assertString } from "./utils/validators.js";

/**
 * ノートを作成する
 * @param note - 作成するノートの情報（id, type, title, created_at, updated_at, deleted_at, publicを含む）
 * @returns 作成されたノート（入力と同じ）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function createNote(note: NoteCore): Promise<NoteCore> {
  return handleDbOperation(`createNote(${note.id})`, async () => {
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO notes_core (id, type, title, created_at, updated_at, deleted_at, public)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        note.id,
        note.type,
        note.title,
        note.created_at,
        note.updated_at,
        note.deleted_at ?? null,
        note.public ?? 0,
      ],
    });
    return note;
  });
}

/**
 * ノートを取得する
 * @param id - 取得するノートのID
 * @returns ノートが見つかった場合はNoteCore、見つからない場合はnull
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function getNote(id: string): Promise<NoteCore | null> {
  return handleDbOperationNullable(`getNote(${id})`, async () => {
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT id, type, title, created_at, updated_at, deleted_at, public
              FROM notes_core
              WHERE id = ? AND deleted_at IS NULL`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToNoteCore(result.rows[0]);
  });
}

/**
 * ノートを更新する
 * @param note - 更新するノートの情報（id, type, title, updated_at, deleted_at, publicを含む）
 * @returns 更新されたノート
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function updateNote(note: NoteCore): Promise<NoteCore> {
  return handleDbOperation(`updateNote(${note.id})`, async () => {
    const db = getDb();
    await db.execute({
      sql: `UPDATE notes_core
              SET type = ?, title = ?, updated_at = ?, deleted_at = ?, public = ?
              WHERE id = ?`,
      args: [
        note.type,
        note.title,
        note.updated_at,
        note.deleted_at ?? null,
        note.public ?? 0,
        note.id,
      ],
    });
    return note;
  });
}

/**
 * ノートを削除する（論理削除）
 * @param id - 削除するノートのID
 * @param deletedAt - 削除日時（Unixタイムスタンプ）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function deleteNote(id: string, deletedAt: number): Promise<void> {
  return handleDbOperation(`deleteNote(${id})`, async () => {
    const db = getDb();
    await db.execute({
      sql: "UPDATE notes_core SET deleted_at = ? WHERE id = ?",
      args: [deletedAt, id],
    });
  });
}

/**
 * 複数のノートを一括削除する（論理削除）
 * @param ids - 削除するノートのID配列
 * @param deletedAt - 削除日時（Unixタイムスタンプ）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function deleteNotesBatch(ids: string[], deletedAt: number): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  return handleDbOperation(`deleteNotesBatch(${ids.length} notes)`, async () => {
    const db = getDb();
    // プレースホルダーを生成
    const placeholders = ids.map(() => "?").join(",");
    await db.execute({
      sql: `UPDATE notes_core SET deleted_at = ? WHERE id IN (${placeholders})`,
      args: [deletedAt, ...ids],
    });
  });
}

/**
 * ノート一覧を取得する
 * @param options - 取得オプション
 * @param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
 * @param options.limit - 取得件数の上限（デフォルト: 100）
 * @param options.offset - 取得開始位置（デフォルト: 0）
 * @returns ノート一覧（updated_atの降順でソート）
 * @throws DatabaseError データベースエラーが発生した場合
 */
export async function listNotes(options: {
  type?: NoteType;
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  return handleDbOperation("listNotes", async () => {
    const db = getDb();
    const { type, limit = 100, offset = 0 } = options;

    const query = createQueryBuilder()
      .select(["id", "type", "title", "created_at", "updated_at", "deleted_at", "public"])
      .from("notes_core")
      .where("deleted_at IS NULL");

    if (type) {
      query.andWhere("type = ?", type);
    }

    query.orderBy("updated_at", "DESC").limit(limit, offset);

    const result = await db.execute({
      sql: query.toSQL(),
      args: query.getArgs(),
    });

    return mapRowsToNoteCore(result.rows);
  });
}

/**
 * タグでフィルタリングされたノート一覧を取得する
 * 複数のタグが指定された場合はOR条件（いずれかのタグが含まれている）
 * @param options - 取得オプション
 * @param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
 * @param options.tagNames - フィルタリングするタグ名の配列（空の場合は全ノートを返す）
 * @param options.limit - 取得件数の上限（デフォルト: 100）
 * @param options.offset - 取得開始位置（デフォルト: 0）
 * @returns タグでフィルタリングされたノート一覧（updated_atの降順でソート）
 */
export async function listNotesByTags(options: {
  type?: NoteType;
  tagNames: string[];
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const db = getDb();
  const { type, tagNames, limit = 100, offset = 0 } = options;

  if (tagNames.length === 0) {
    return listNotes({ type, limit, offset });
  }

  // いずれかの指定されたタグが含まれているノートを取得（OR条件）
  // DISTINCTを使用して重複を除去
  const query = createQueryBuilder()
    .select([
      "nc.id",
      "nc.type",
      "nc.title",
      "nc.created_at",
      "nc.updated_at",
      "nc.deleted_at",
      "nc.public",
    ])
    .distinct()
    .from("notes_core", "nc")
    .join("note_tags", "nt", "nc.id = nt.note_id")
    .join("tags", "t", "nt.tag_id = t.id")
    .where("nc.deleted_at IS NULL")
    .whereIn("t.name", tagNames);

  if (type) {
    query.andWhere("nc.type = ?", type);
  }

  query.orderBy("nc.updated_at", "DESC").limit(limit, offset);

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToNoteCore(result.rows);
}

/**
 * 公開ノート一覧を取得する
 * @param options - 取得オプション
 * @param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
 * @param options.limit - 取得件数の上限（デフォルト: 100）
 * @param options.offset - 取得開始位置（デフォルト: 0）
 * @returns 公開設定が有効なノート一覧（updated_atの降順でソート）
 */
export async function listPublicNotes(options: {
  type?: NoteType;
  limit?: number;
  offset?: number;
}): Promise<NoteCore[]> {
  const db = getDb();
  const { type, limit = 100, offset = 0 } = options;

  const query = createQueryBuilder()
    .select(["id", "type", "title", "created_at", "updated_at", "deleted_at", "public"])
    .from("notes_core")
    .where("deleted_at IS NULL")
    .andWhere("public = ?", 1);

  if (type) {
    query.andWhere("type = ?", type);
  }

  query.orderBy("updated_at", "DESC").limit(limit, offset);

  const result = await db.execute({
    sql: query.toSQL(),
    args: query.getArgs(),
  });

  return mapRowsToNoteCore(result.rows);
}

/**
 * ノート一覧とタグ情報を一度に取得する（最適化版）
 * ノートID -> タグ名の配列のマップを返す
 * @param options - 取得オプション
 * @param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
 * @param options.tagNames - フィルタリングするタグ名の配列（空の場合は全ノートを返す）
 * @param options.limit - 取得件数の上限（デフォルト: 10000）
 * @param options.offset - 取得開始位置（デフォルト: 0）
 * @returns ノート一覧とタグマップ（ノートID -> タグ名の配列）
 */
export async function getNotesWithTags(options: {
  type?: NoteType;
  tagNames?: string[];
  limit?: number;
  offset?: number;
}): Promise<{
  notes: NoteCore[];
  tagsMap: Map<string, string[]>;
}> {
  const db = getDb();
  const { type, tagNames = [], limit = 10000, offset = 0 } = options;

  // ノート一覧を取得
  let notes: NoteCore[];
  if (tagNames.length > 0) {
    notes = await listNotesByTags({ type, tagNames, limit, offset });
  } else {
    notes = await listNotes({ type, limit, offset });
  }

  if (notes.length === 0) {
    return { notes: [], tagsMap: new Map() };
  }

  // ノートIDのリストを作成
  const noteIds = notes.map((n) => n.id);
  const placeholders = noteIds.map(() => "?").join(",");

  // すべてのノートのタグを一度に取得（JOINクエリで効率化）
  const tagsResult = await db.execute({
    sql: `SELECT nt.note_id, t.name
          FROM note_tags nt
          INNER JOIN tags t ON nt.tag_id = t.id
          WHERE nt.note_id IN (${placeholders})
          ORDER BY nt.note_id, t.name`,
    args: noteIds,
  });

  // ノートID -> タグ名の配列のマップを作成
  const tagsMap = new Map<string, string[]>();
  for (const row of tagsResult.rows) {
    const noteId = assertString(row.note_id, "note_id");
    const tagName = assertString(row.name, "name");
    const existing = tagsMap.get(noteId) || [];
    existing.push(tagName);
    tagsMap.set(noteId, existing);
  }

  // タグがないノートもマップに含める（空配列）
  for (const note of notes) {
    if (!tagsMap.has(note.id)) {
      tagsMap.set(note.id, []);
    }
  }

  return { notes, tagsMap };
}
