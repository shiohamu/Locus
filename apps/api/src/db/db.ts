import { createClient } from "@libsql/client";

/**
 * データベースクライアントを取得する
 * 環境変数に基づいてTursoまたはローカルSQLiteに接続する
 */
export function getDb() {
	const url = process.env.DATABASE_URL;
	const authToken = process.env.DATABASE_AUTH_TOKEN;

	if (!url) {
		throw new Error("DATABASE_URL environment variable is required");
	}

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


