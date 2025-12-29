/**
 * 型ガード関数
 * 実行時に型を安全に検証する
 */

import type {
	File,
	Link,
	LLMConfig,
	NoteCore,
	NoteMD,
	NoteType,
	RSSFeed,
	RSSItem,
	Tag,
	WebClip,
} from "@locus/shared";

/**
 * データベース行の型定義
 */
export interface DbRow {
	[key: string]: unknown;
}

/**
 * 文字列型ガード
 */
export function isString(value: unknown): value is string {
	return typeof value === "string";
}

/**
 * 数値型ガード
 */
export function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

/**
 * null型ガード
 */
export function isNull(value: unknown): value is null {
	return value === null;
}

/**
 * オブジェクト型ガード
 */
export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * NoteType型ガード
 */
export function isNoteType(value: unknown): value is NoteType {
	return (
		typeof value === "string" &&
		(value === "md" || value === "rss" || value === "web_clip")
	);
}

/**
 * NoteCore行の型ガード
 */
export function isNoteCoreRow(row: DbRow): row is {
	id: string;
	type: NoteType;
	title: string;
	created_at: number;
	updated_at: number;
	deleted_at: number | null;
	public?: number;
} {
	return (
		isString(row.id) &&
		isNoteType(row.type) &&
		isString(row.title) &&
		isNumber(row.created_at) &&
		isNumber(row.updated_at) &&
		(row.deleted_at === null || isNumber(row.deleted_at)) &&
		(row.public === undefined || isNumber(row.public))
	);
}

/**
 * Tag行の型ガード
 */
export function isTagRow(row: DbRow): row is {
	id: string;
	name: string;
} {
	return isString(row.id) && isString(row.name);
}

/**
 * File行の型ガード
 */
export function isFileRow(row: DbRow): row is {
	id: string;
	filename: string;
	mime_type: string;
	size: number;
	created_at: number;
	show_in_notes: number | null;
} {
	return (
		isString(row.id) &&
		isString(row.filename) &&
		isString(row.mime_type) &&
		isNumber(row.size) &&
		isNumber(row.created_at) &&
		(row.show_in_notes === null || isNumber(row.show_in_notes))
	);
}

/**
 * RSSFeed行の型ガード
 */
export function isRSSFeedRow(row: DbRow): row is {
	id: string;
	url: string;
	title: string;
	last_fetched_at: number | null;
} {
	return (
		isString(row.id) &&
		isString(row.url) &&
		isString(row.title) &&
		(row.last_fetched_at === null || isNumber(row.last_fetched_at))
	);
}

/**
 * RSSItem行の型ガード
 */
export function isRSSItemRow(row: DbRow): row is {
	note_id: string;
	feed_id: string;
	url: string;
	content: string;
	published_at: number;
} {
	return (
		isString(row.note_id) &&
		isString(row.feed_id) &&
		isString(row.url) &&
		isString(row.content) &&
		isNumber(row.published_at)
	);
}

/**
 * WebClip行の型ガード
 */
export function isWebClipRow(row: DbRow): row is {
	note_id: string;
	source_url: string;
	fetched_at: number;
	content: string;
} {
	return (
		isString(row.note_id) &&
		isString(row.source_url) &&
		isNumber(row.fetched_at) &&
		isString(row.content)
	);
}

/**
 * Link行の型ガード
 */
export function isLinkRow(row: DbRow): row is {
	from_note_id: string;
	to_note_id: string;
} {
	return isString(row.from_note_id) && isString(row.to_note_id);
}

/**
 * NoteMD行の型ガード
 */
export function isNoteMDRow(row: DbRow): row is {
	note_id: string;
	content: string;
} {
	return isString(row.note_id) && isString(row.content);
}

