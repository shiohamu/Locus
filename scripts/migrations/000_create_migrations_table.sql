-- マイグレーション追跡テーブル
-- このテーブルは、実行済みマイグレーションを記録するために使用されます

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);

