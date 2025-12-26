import { createClient } from "@libsql/client";

/**
 * データベースクライアントを取得する
 * 環境変数に基づいてTursoまたはローカルSQLiteに接続する
 */
export function getDb() {
  // 開発環境ではデフォルトでローカルSQLiteを使用
  // apps/api/data/locus.db をデフォルトパスとする
  const defaultDbPath = import.meta.dir
    ? `${import.meta.dir}/../../data/locus.db`
    : "./data/locus.db";
  const url = process.env.DATABASE_URL || `file:${defaultDbPath}`;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  // ローカルSQLiteの場合（file:で始まる）
  if (url.startsWith("file:") || url.startsWith("sqlite:")) {
    return createClient({
      url,
    });
  }

  // Tursoの場合
  return createClient({
    url,
    authToken,
  });
}
