import { type Client, createClient } from "@libsql/client";

// シングルトンインスタンスを保持
let dbInstance: Client | null = null;
let currentUrl: string | null = null;
let currentAuthToken: string | undefined = null;

/**
 * データベースクライアントを取得する
 * 環境変数に基づいてTursoまたはローカルSQLiteに接続する
 * シングルトンパターンで同じインスタンスを再利用する
 */
export function getDb(): Client {
  // 開発環境ではデフォルトでローカルSQLiteを使用
  // apps/api/data/locus.db をデフォルトパスとする
  const defaultDbPath = import.meta.dir
    ? `${import.meta.dir}/../../data/locus.db`
    : "./data/locus.db";
  const url = process.env.DATABASE_URL || `file:${defaultDbPath}`;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  // URLまたは認証トークンが変更された場合は、既存の接続を閉じて新しい接続を作成
  if (dbInstance && (currentUrl !== url || currentAuthToken !== authToken)) {
    dbInstance.close().catch(() => {
      // エラーは無視（既に閉じられている可能性がある）
    });
    dbInstance = null;
    currentUrl = null;
    currentAuthToken = null;
  }

  // 既存のインスタンスがある場合は再利用
  if (dbInstance) {
    return dbInstance;
  }

  // 新しいインスタンスを作成
  currentUrl = url;
  currentAuthToken = authToken;

  // ローカルSQLiteの場合（file:で始まる）
  if (url.startsWith("file:") || url.startsWith("sqlite:")) {
    dbInstance = createClient({
      url,
    });
  } else {
    // Tursoの場合
    dbInstance = createClient({
      url,
      authToken,
    });
  }

  return dbInstance;
}

/**
 * データベース接続を閉じる（主にテスト用）
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    currentUrl = null;
    currentAuthToken = null;
  }
}
