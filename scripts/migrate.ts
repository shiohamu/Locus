import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

/**
 * データベースマイグレーションを実行する
 */
async function migrate() {
  // デフォルトでローカルSQLiteを使用
  const defaultDbPath = import.meta.dir
    ? join(import.meta.dir, "../apps/api/data/locus.db")
    : "./apps/api/data/locus.db";
  const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  // データベースクライアントを作成
  const client =
    dbUrl.startsWith("file:") || dbUrl.startsWith("sqlite:")
      ? createClient({ url: dbUrl })
      : createClient({ url: dbUrl, authToken: dbAuthToken });

  try {
    // 外部キー制約を有効にする
    await client.execute("PRAGMA foreign_keys = ON;");

    // マイグレーションファイルのリスト（順番に実行）
    const migrationFiles = [
      "001_initial_schema.sql",
      "002_add_web_clips.sql",
      "003_add_files.sql",
      "004_add_settings.sql",
    ];

    // 各マイグレーションファイルを実行
    for (const migrationFile of migrationFiles) {
      const migrationPath = join(import.meta.dir || ".", "migrations", migrationFile);
      const sql = readFileSync(migrationPath, "utf-8");

      console.log(`Running migration: ${migrationFile}`);

      // SQLを実行（複数のステートメントを分割）
      // コメント行と空行を除外し、セミコロンで分割
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
            await client.execute(statement);
          } catch (error) {
            // CREATE TABLE IF NOT EXISTS などのエラーは無視
            if (
              error instanceof Error &&
              !error.message.includes("already exists") &&
              !error.message.includes("duplicate")
            ) {
              console.warn(`Warning executing statement: ${statement.substring(0, 50)}...`);
              console.warn(`Error: ${error.message}`);
            }
          }
        }
      }
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

if (import.meta.main) {
  migrate();
}
