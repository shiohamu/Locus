import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Client, createClient } from "@libsql/client";

/**
 * テスト用のインメモリデータベースを作成し、マイグレーションを実行する
 */
export async function createTestDb(): Promise<Client> {
  const db = createClient({
    url: "file::memory:",
  });

  // 外部キー制約を有効にする
  await db.execute("PRAGMA foreign_keys = ON;");

  // マイグレーションファイルを読み込む
  const migrationPath = join(
    import.meta.dir || ".",
    "../../../../scripts/migrations/001_initial_schema.sql"
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

  return db;
}

/**
 * テスト用のデータベースをクリーンアップする
 */
export async function cleanupTestDb(db: Client): Promise<void> {
  await db.close();
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

  // マイグレーションファイルを読み込む
  const migrationPath = join(
    import.meta.dir || ".",
    "../../../../scripts/migrations/001_initial_schema.sql"
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

  return { db, path: tmpPath };
}

/**
 * テスト用のデータベースファイルをクリーンアップする
 */
export async function cleanupTestDbFile(db: Client, path: string): Promise<void> {
  await db.close();
  // ファイルを削除
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(path);
  } catch (error) {
    // ファイルが存在しない場合は無視
  }
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
