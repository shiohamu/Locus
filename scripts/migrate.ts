import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

/**
 * SQLステートメントを解析して実行可能なステートメントの配列に分割
 */
function parseSQL(sql: string): string[] {
  return sql
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
}

/**
 * 実行済みマイグレーションのバージョン一覧を取得
 */
async function getAppliedMigrations(client: any): Promise<Set<string>> {
  try {
    const result = await client.execute("SELECT version FROM schema_migrations");
    return new Set(result.rows.map((row: any) => row.version as string));
  } catch (error) {
    // テーブルが存在しない場合は空のセットを返す
    return new Set();
  }
}

/**
 * マイグレーションを実行済みとして記録
 */
async function recordMigration(client: any, version: string): Promise<void> {
  const appliedAt = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)",
    args: [version, appliedAt],
  });
}

/**
 * テーブルにカラムが存在するかチェック
 */
async function columnExists(client: any, tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await client.execute({
      sql: `PRAGMA table_info(${tableName})`,
    });
    return result.rows.some((row: any) => row.name === columnName);
  } catch {
    return false;
  }
}

/**
 * ALTER TABLE ADD COLUMN文を安全に実行
 * カラムが既に存在する場合はスキップ
 */
async function safeAddColumn(
  client: any,
  tableName: string,
  columnName: string,
  columnDefinition: string
): Promise<boolean> {
  if (await columnExists(client, tableName, columnName)) {
    console.log(`  Column ${tableName}.${columnName} already exists, skipping`);
    return false;
  }

  await client.execute({
    sql: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`,
  });
  return true;
}

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

    // マイグレーション追跡テーブルを作成（最初に実行）
    const migrationsTablePath = join(
      import.meta.dir || ".",
      "migrations",
      "000_create_migrations_table.sql"
    );
    const migrationsTableSQL = readFileSync(migrationsTablePath, "utf-8");
    const migrationsTableStatements = parseSQL(migrationsTableSQL);

    for (const statement of migrationsTableStatements) {
      if (statement) {
        try {
          await client.execute(statement);
        } catch (error) {
          // テーブルが既に存在する場合は無視
          if (
            error instanceof Error &&
            !error.message.includes("already exists") &&
            !error.message.includes("duplicate")
          ) {
            console.warn(`Warning creating migrations table: ${error.message}`);
          }
        }
      }
    }

    // 実行済みマイグレーションを取得
    const appliedMigrations = await getAppliedMigrations(client);

    // マイグレーションファイルのリスト（順番に実行）
    const migrationFiles = [
      "001_initial_schema.sql",
      "002_add_web_clips.sql",
      "003_add_files.sql",
      "004_add_settings.sql",
      "005_add_public_flag.sql",
      "006_add_file_show_in_notes.sql",
    ];

    // 各マイグレーションファイルを実行
    for (const migrationFile of migrationFiles) {
      const version = migrationFile.replace(".sql", "");

      // 既に実行済みの場合はスキップ
      if (appliedMigrations.has(version)) {
        console.log(`Skipping already applied migration: ${migrationFile}`);
        continue;
      }

      const migrationPath = join(import.meta.dir || ".", "migrations", migrationFile);

      // ファイルが存在するか確認
      try {
        const sql = readFileSync(migrationPath, "utf-8");
        const statements = parseSQL(sql);

        console.log(`Running migration: ${migrationFile}`);

        // トランザクション内で実行（可能な場合）
        let hasError = false;
        for (const statement of statements) {
          if (statement) {
            try {
              // ALTER TABLE ADD COLUMN文を特別に処理
              const alterTableMatch = statement.match(
                /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)\s+(.+)/i
              );
              if (alterTableMatch) {
                const [, tableName, columnName, columnDefinition] = alterTableMatch;
                await safeAddColumn(client, tableName, columnName, columnDefinition);
              } else {
                await client.execute(statement);
              }
            } catch (error) {
              // CREATE TABLE IF NOT EXISTS や ALTER TABLE の既存カラムエラーは無視
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (
                  errorMessage.includes("already exists") ||
                  errorMessage.includes("duplicate") ||
                  errorMessage.includes("duplicate column name")
                ) {
                  console.log(`  Skipping (already exists): ${statement.substring(0, 50)}...`);
                  continue;
                }
              }
              console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
              console.error(`Error: ${error}`);
              hasError = true;
              break;
            }
          }
        }

        if (!hasError) {
          // マイグレーションを実行済みとして記録
          await recordMigration(client, version);
          console.log(`  ✓ Migration ${migrationFile} completed`);
        } else {
          console.error(`  ✗ Migration ${migrationFile} failed`);
          throw new Error(`Migration ${migrationFile} failed`);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Migration")) {
          throw error;
        }
        console.error(`Error reading migration file ${migrationFile}:`, error);
        throw error;
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
