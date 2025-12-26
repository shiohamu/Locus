-- Phase2 PDF/File管理機能追加

-- ファイルテーブル
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

-- ファイルとノートの関連テーブル
CREATE TABLE IF NOT EXISTS file_notes (
    file_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    PRIMARY KEY (file_id, note_id),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes_core(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_file_notes_file_id ON file_notes(file_id);
CREATE INDEX IF NOT EXISTS idx_file_notes_note_id ON file_notes(note_id);

