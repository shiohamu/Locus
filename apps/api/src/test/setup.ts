import type { Client } from "@libsql/client";
import { cleanupTestDb, createTestDb } from "./helpers.js";

// テスト用のデータベースインスタンスを保持
let testDb: Client | null = null;

/**
 * テスト前にデータベースをセットアップする
 * 環境変数DATABASE_URLを設定して、getDb()がテスト用データベースを使用するようにする
 */
export async function setupTestDb(): Promise<void> {
  // 各テストで独立したインメモリデータベースを作成
  // 環境変数を使用してgetDb()を制御する代わりに、
  // テストでは直接データベース操作を行うか、モックを使用する
  testDb = await createTestDb();

  // 環境変数を設定（Bunではprocess.envを直接変更可能）
  // ただし、getDb()は毎回新しいクライアントを作成するため、
  // インメモリデータベースは共有できない
  // そのため、テストでは各テストで独立したデータベースを使用する
}

/**
 * テスト後にデータベースをクリーンアップする
 */
export async function teardownTestDb(): Promise<void> {
  if (testDb) {
    await cleanupTestDb(testDb);
    testDb = null;
  }
}

/**
 * テスト用のデータベースインスタンスを取得する
 */
export function getTestDb(): Client {
  if (!testDb) {
    throw new Error("Test database not initialized. Call setupTestDb() first.");
  }
  return testDb;
}
