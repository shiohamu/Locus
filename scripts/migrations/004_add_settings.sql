-- Phase3 設定テーブル追加

-- 設定テーブル（キー・バリュー形式）
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- LLM設定のデフォルトキー
-- 'llm_config' というキーでJSON形式で保存





