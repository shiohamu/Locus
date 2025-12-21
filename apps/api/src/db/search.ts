import type { NoteCore } from "@locus/shared";
import { getDb } from "./db.js";

/**
 * 全文検索を実行する
 */
export async function searchNotes(
	query: string,
	options: { limit?: number; offset?: number } = {},
): Promise<NoteCore[]> {
	const db = getDb();
	const { limit = 100, offset = 0 } = options;

	const result = await db.execute({
		sql: `SELECT nc.id, nc.type, nc.title, nc.created_at, nc.updated_at, nc.deleted_at
              FROM notes_core nc
              INNER JOIN notes_fts nf ON nc.id = nf.note_id
              WHERE notes_fts MATCH ? AND nc.deleted_at IS NULL
              ORDER BY rank
              LIMIT ? OFFSET ?`,
		args: [query, limit, offset],
	});

	return result.rows.map((row) => ({
		id: row.id as string,
		type: row.type as "md" | "rss",
		title: row.title as string,
		created_at: row.created_at as number,
		updated_at: row.updated_at as number,
		deleted_at: (row.deleted_at as number | null) ?? null,
	}));
}

/**
 * FTSインデックスを更新する
 */
export async function updateFTS(
	noteId: string,
	title: string,
	content: string,
): Promise<void> {
	const db = getDb();
	await db.execute({
		sql: `INSERT INTO notes_fts (note_id, title, content) VALUES (?, ?, ?)
              ON CONFLICT(note_id) DO UPDATE SET title = ?, content = ?`,
		args: [noteId, title, content, title, content],
	});
}


