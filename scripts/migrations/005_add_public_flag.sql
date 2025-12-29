-- Phase4: 公開/Wiki機能用のマイグレーション
-- notes_coreテーブルにpublicカラムを追加

-- 公開設定フラグ（0 = 非公開、1 = 公開）
ALTER TABLE notes_core ADD COLUMN public INTEGER NOT NULL DEFAULT 0;

-- 公開ノート検索用のインデックス
CREATE INDEX IF NOT EXISTS idx_notes_core_public ON notes_core(public);






