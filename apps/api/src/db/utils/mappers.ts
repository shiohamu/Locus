/**
 * データベース行からオブジェクトへのマッピング関数
 * 型安全性を確保し、重複コードを削減する
 */

import { ValidationError } from "../../utils/errors.js";

import type { File, NoteCore, NoteType, Tag } from "@locus/shared";

/**
 * データベース行の型定義
 */
interface DbRow {
  [key: string]: unknown;
}

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
    deleted_at: row.deleted_at === null ? null : assertNumber(row.deleted_at, "deleted_at"),
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
  return {
    id: assertString(row.id, "id"),
    filename: assertString(row.filename, "filename"),
    mime_type: assertString(row.mime_type, "mime_type"),
    size: assertNumber(row.size, "size"),
    created_at: assertNumber(row.created_at, "created_at"),
    show_in_notes: (row.show_in_notes as number | null) === 1,
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
 * 型安全な文字列アサーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns 文字列
 * @throws Error 値が文字列でない場合
 */
function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Expected string for field "${fieldName}", got ${typeof value}`);
  }
  return value;
}

/**
 * 型安全な数値アサーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns 数値
 * @throws Error 値が数値でない場合
 */
function assertNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number") {
    throw new ValidationError(`Expected number for field "${fieldName}", got ${typeof value}`);
  }
  return value;
}

/**
 * 型安全なNoteTypeアサーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns NoteType
 * @throws Error 値がNoteTypeでない場合
 */
function assertNoteType(value: unknown, fieldName: string): NoteType {
  if (typeof value !== "string" || !["md", "rss", "web_clip"].includes(value)) {
    throw new ValidationError(`Expected NoteType for field "${fieldName}", got ${typeof value}`);
  }
  return value as NoteType;
}

