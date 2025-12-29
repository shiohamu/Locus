-- Phase3 ファイルのノート一覧への表示オンオフ機能追加

-- filesテーブルにshow_in_notesカラムを追加
ALTER TABLE files ADD COLUMN show_in_notes INTEGER NOT NULL DEFAULT 0;

-- インデックスを追加（show_in_notes=trueのファイルを効率的に取得するため）
CREATE INDEX IF NOT EXISTS idx_files_show_in_notes ON files(show_in_notes);

