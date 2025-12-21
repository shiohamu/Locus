-- Phase1 初期スキーマ

-- 共通ノートテーブル
CREATE TABLE IF NOT EXISTS notes_core (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
);

-- Markdownノートテーブル
CREATE TABLE IF NOT EXISTS notes_md (
    note_id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes_core(id) ON DELETE CASCADE
);

-- RSSフィードテーブル
CREATE TABLE IF NOT EXISTS rss_feeds (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    last_fetched_at INTEGER
);

-- RSSアイテムテーブル
CREATE TABLE IF NOT EXISTS rss_items (
    note_id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    url TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at INTEGER NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes_core(id) ON DELETE CASCADE,
    FOREIGN KEY (feed_id) REFERENCES rss_feeds(id) ON DELETE CASCADE
);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- ノートタグ関連テーブル
CREATE TABLE IF NOT EXISTS note_tags (
    note_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes_core(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 双方向リンクテーブル
CREATE TABLE IF NOT EXISTS links (
    from_note_id TEXT NOT NULL,
    to_note_id TEXT NOT NULL,
    PRIMARY KEY (from_note_id, to_note_id),
    FOREIGN KEY (from_note_id) REFERENCES notes_core(id) ON DELETE CASCADE,
    FOREIGN KEY (to_note_id) REFERENCES notes_core(id) ON DELETE CASCADE
);

-- 全文検索用FTS5テーブル
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    note_id UNINDEXED,
    title,
    content,
    content_rowid=note_id
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notes_core_type ON notes_core(type);
CREATE INDEX IF NOT EXISTS idx_notes_core_updated_at ON notes_core(updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_core_deleted_at ON notes_core(deleted_at);
CREATE INDEX IF NOT EXISTS idx_rss_items_feed_id ON rss_items(feed_id);
CREATE INDEX IF NOT EXISTS idx_rss_items_published_at ON rss_items(published_at);
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_links_from_note_id ON links(from_note_id);
CREATE INDEX IF NOT EXISTS idx_links_to_note_id ON links(to_note_id);


