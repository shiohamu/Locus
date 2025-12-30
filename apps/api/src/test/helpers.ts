import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Client, createClient } from "@libsql/client";
import { closeDb } from "../db/db.js";

/**
 * テスト用のインメモリデータベースを作成し、マイグレーションを実行する
 */
export async function createTestDb(): Promise<Client> {
	const db = createClient({
		url: "file::memory:",
	});

	// 外部キー制約を有効にする
	await db.execute("PRAGMA foreign_keys = ON;");

	// すべてのマイグレーションファイルを順次実行
	await executeMigration(db, "001_initial_schema.sql");
	await executeMigration(db, "002_add_web_clips.sql");
	await executeMigration(db, "003_add_files.sql");
	await executeMigration(db, "004_add_settings.sql");
	await executeMigration(db, "005_add_public_flag.sql");
	await executeMigration(db, "006_add_file_show_in_notes.sql");

	return db;
}

/**
 * テスト用のデータベースをクリーンアップする
 */
export async function cleanupTestDb(db: Client): Promise<void> {
  await db.close();
}

/**
 * SQLファイルを実行するヘルパー関数
 */
async function executeMigration(db: Client, migrationFile: string): Promise<void> {
  const migrationPath = join(
    import.meta.dir || ".",
    `../../../../scripts/migrations/${migrationFile}`
  );
  const sql = readFileSync(migrationPath, "utf-8");

  // SQLを実行（複数のステートメントを分割）
  const statements = sql
    .split("\n")
    .map((line) => {
      // 行コメントを除去
      const commentIndex = line.indexOf("--");
      if (commentIndex >= 0) {
        return line.substring(0, commentIndex).trim();
      }
      return line.trim();
    })
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    if (statement) {
      try {
        await db.execute(statement);
      } catch (error) {
        // CREATE TABLE IF NOT EXISTS などのエラーは無視
        if (
          error instanceof Error &&
          !error.message.includes("already exists") &&
          !error.message.includes("duplicate")
        ) {
          throw error;
        }
      }
    }
  }
}

/**
 * テスト用の一時データベースファイルを作成し、マイグレーションを実行する
 * 各テストで独立したデータベースを使用するために使用
 */
export async function createTestDbFile(): Promise<{ db: Client; path: string }> {
  // 一時ファイルパスを生成
  const tmpPath = `/tmp/locus-test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`;
  const db = createClient({
    url: `file:${tmpPath}`,
  });

  // 外部キー制約を有効にする
  await db.execute("PRAGMA foreign_keys = ON;");

	// マイグレーションファイルを順次実行
	await executeMigration(db, "001_initial_schema.sql");
	await executeMigration(db, "002_add_web_clips.sql");
	await executeMigration(db, "003_add_files.sql");
	await executeMigration(db, "004_add_settings.sql");
	await executeMigration(db, "005_add_public_flag.sql");
	await executeMigration(db, "006_add_file_show_in_notes.sql");

	return { db, path: tmpPath };
}

/**
 * テスト用のデータベースファイルをクリーンアップする
 */
export async function cleanupTestDbFile(db: Client, path: string): Promise<void> {
  await db.close();
  // getDb()で作成された接続も閉じる
  await closeDb();
  // ファイルを削除
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(path);
  } catch (error) {
    // ファイルが存在しない場合は無視
  }
}

/**
 * テスト終了時にgetDb()で作成された接続をクリーンアップする
 * 各テストのafterEachで呼び出す
 */
export async function cleanupGlobalDb(): Promise<void> {
  await closeDb();
}

/**
 * テスト用のモックデータを生成するヘルパー関数
 */
export function createTestNoteCore(
  overrides?: Partial<import("@locus/shared").NoteCore>
): import("@locus/shared").NoteCore {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: crypto.randomUUID(),
    type: "md",
    title: "Test Note",
    created_at: now,
    updated_at: now,
    deleted_at: null,
    ...overrides,
  };
}

export function createTestTag(
  overrides?: Partial<import("@locus/shared").Tag>
): import("@locus/shared").Tag {
  return {
    id: crypto.randomUUID(),
    name: "test-tag",
    ...overrides,
  };
}

export function createTestRSSFeed(
  overrides?: Partial<import("@locus/shared").RSSFeed>
): import("@locus/shared").RSSFeed {
  return {
    id: crypto.randomUUID(),
    url: "https://example.com/feed.xml",
    title: "Test Feed",
    last_fetched_at: null,
    ...overrides,
  };
}

export function createTestWebClip(
  overrides?: Partial<import("@locus/shared").WebClip>
): import("@locus/shared").WebClip {
  const now = Math.floor(Date.now() / 1000);
  return {
    note_id: crypto.randomUUID(),
    source_url: "https://example.com/article",
    fetched_at: now,
    content: "Test content",
    ...overrides,
  };
}

export function createTestNoteMD(
  overrides?: Partial<import("@locus/shared").NoteMD>
): import("@locus/shared").NoteMD {
  return {
    note_id: crypto.randomUUID(),
    content: "Test content",
    ...overrides,
  };
}

export function createTestRSSItem(
  overrides?: Partial<import("@locus/shared").RSSItem>
): import("@locus/shared").RSSItem {
  const now = Math.floor(Date.now() / 1000);
  return {
    note_id: crypto.randomUUID(),
    feed_id: crypto.randomUUID(),
    title: "Test RSS Item",
    link: "https://example.com/item",
    content: "Test content",
    published_at: now,
    ...overrides,
  };
}

export function createTestFile(
  overrides?: Partial<import("@locus/shared").File>
): import("@locus/shared").File {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: crypto.randomUUID(),
    filename: "test.pdf",
    mime_type: "application/pdf",
    size: 1024,
    created_at: now,
    ...overrides,
  };
}
