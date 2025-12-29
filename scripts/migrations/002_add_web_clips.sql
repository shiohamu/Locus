-- Phase2 Webクリップ機能追加

-- Webクリップテーブル
CREATE TABLE IF NOT EXISTS web_clips (
    note_id TEXT PRIMARY KEY,
    source_url TEXT NOT NULL,
    fetched_at INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes_core(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_web_clips_source_url ON web_clips(source_url);
CREATE INDEX IF NOT EXISTS idx_web_clips_fetched_at ON web_clips(fetched_at);






