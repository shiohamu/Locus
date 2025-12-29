/**
 * データベース行からオブジェクトへのマッピング関数
 * 型安全性を確保し、重複コードを削減する
 */

import type {
	File,
	Link,
	NoteCore,
	NoteMD,
	RSSFeed,
	RSSItem,
	Tag,
	WebClip,
} from "@locus/shared";
import {
	assertNumber,
	assertNumberOrNull,
	assertNoteType,
	assertString,
} from "./validators.js";
import type { DbRow } from "./type-guards.js";

/**
 * NoteCoreにマッピングする
 * @param row データベース行
 * @returns NoteCoreオブジェクト
 */
export function mapRowToNoteCore(row: DbRow): NoteCore {
	return {
		id: assertString(row.id, "id"),
		type: assertNoteType(row.type, "type"),
		title: assertString(row.title, "title"),
		created_at: assertNumber(row.created_at, "created_at"),
		updated_at: assertNumber(row.updated_at, "updated_at"),
		deleted_at: assertNumberOrNull(row.deleted_at, "deleted_at"),
		public: row.public === undefined ? 0 : assertNumber(row.public, "public"),
	};
}

/**
 * Tagにマッピングする
 * @param row データベース行
 * @returns Tagオブジェクト
 */
export function mapRowToTag(row: DbRow): Tag {
  return {
    id: assertString(row.id, "id"),
    name: assertString(row.name, "name"),
  };
}

/**
 * Fileにマッピングする
 * @param row データベース行
 * @returns Fileオブジェクト
 */
export function mapRowToFile(row: DbRow): File {
	const showInNotes = row.show_in_notes;
	return {
		id: assertString(row.id, "id"),
		filename: assertString(row.filename, "filename"),
		mime_type: assertString(row.mime_type, "mime_type"),
		size: assertNumber(row.size, "size"),
		created_at: assertNumber(row.created_at, "created_at"),
		show_in_notes:
			showInNotes === null || showInNotes === undefined
				? false
				: assertNumber(showInNotes, "show_in_notes") === 1,
	};
}

/**
 * 複数の行をNoteCoreの配列にマッピングする
 * @param rows データベース行の配列
 * @returns NoteCoreの配列
 */
export function mapRowsToNoteCore(rows: DbRow[]): NoteCore[] {
  return rows.map(mapRowToNoteCore);
}

/**
 * 複数の行をTagの配列にマッピングする
 * @param rows データベース行の配列
 * @returns Tagの配列
 */
export function mapRowsToTag(rows: DbRow[]): Tag[] {
  return rows.map(mapRowToTag);
}

/**
 * 複数の行をFileの配列にマッピングする
 * @param rows データベース行の配列
 * @returns Fileの配列
 */
export function mapRowsToFile(rows: DbRow[]): File[] {
	return rows.map(mapRowToFile);
}

/**
 * RSSFeedにマッピングする
 * @param row データベース行
 * @returns RSSFeedオブジェクト
 */
export function mapRowToRSSFeed(row: DbRow): RSSFeed {
	return {
		id: assertString(row.id, "id"),
		url: assertString(row.url, "url"),
		title: assertString(row.title, "title"),
		last_fetched_at: assertNumberOrNull(row.last_fetched_at, "last_fetched_at"),
	};
}

/**
 * 複数の行をRSSFeedの配列にマッピングする
 * @param rows データベース行の配列
 * @returns RSSFeedの配列
 */
export function mapRowsToRSSFeed(rows: DbRow[]): RSSFeed[] {
	return rows.map(mapRowToRSSFeed);
}

/**
 * RSSItemにマッピングする
 * @param row データベース行
 * @returns RSSItemオブジェクト
 */
export function mapRowToRSSItem(row: DbRow): RSSItem {
	return {
		note_id: assertString(row.note_id, "note_id"),
		feed_id: assertString(row.feed_id, "feed_id"),
		url: assertString(row.url, "url"),
		content: assertString(row.content, "content"),
		published_at: assertNumber(row.published_at, "published_at"),
	};
}

/**
 * 複数の行をRSSItemの配列にマッピングする
 * @param rows データベース行の配列
 * @returns RSSItemの配列
 */
export function mapRowsToRSSItem(rows: DbRow[]): RSSItem[] {
	return rows.map(mapRowToRSSItem);
}

/**
 * WebClipにマッピングする
 * @param row データベース行
 * @returns WebClipオブジェクト
 */
export function mapRowToWebClip(row: DbRow): WebClip {
	return {
		note_id: assertString(row.note_id, "note_id"),
		source_url: assertString(row.source_url, "source_url"),
		fetched_at: assertNumber(row.fetched_at, "fetched_at"),
		content: assertString(row.content, "content"),
	};
}

/**
 * 複数の行をWebClipの配列にマッピングする
 * @param rows データベース行の配列
 * @returns WebClipの配列
 */
export function mapRowsToWebClip(rows: DbRow[]): WebClip[] {
	return rows.map(mapRowToWebClip);
}

/**
 * Linkにマッピングする
 * @param row データベース行
 * @returns Linkオブジェクト
 */
export function mapRowToLink(row: DbRow): Link {
	return {
		from_note_id: assertString(row.from_note_id, "from_note_id"),
		to_note_id: assertString(row.to_note_id, "to_note_id"),
	};
}

/**
 * 複数の行をLinkの配列にマッピングする
 * @param rows データベース行の配列
 * @returns Linkの配列
 */
export function mapRowsToLink(rows: DbRow[]): Link[] {
	return rows.map(mapRowToLink);
}

/**
 * NoteMDにマッピングする
 * @param row データベース行
 * @returns NoteMDオブジェクト
 */
export function mapRowToNoteMD(row: DbRow): NoteMD {
	return {
		note_id: assertString(row.note_id, "note_id"),
		content: assertString(row.content, "content"),
	};
}

/**
 * 複数の行をNoteMDの配列にマッピングする
 * @param rows データベース行の配列
 * @returns NoteMDの配列
 */
export function mapRowsToNoteMD(rows: DbRow[]): NoteMD[] {
	return rows.map(mapRowToNoteMD);
}

