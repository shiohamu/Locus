# 個人向け PKM Web アプリケーション 仕様書

## 1. 目的
個人利用を主目的とした PKM（Personal Knowledge Management）Web アプリケーションを構築する。ローカルファーストを前提とし、複数デバイス間での同期を可能とする。将来的に Wiki 的な公開拡張が可能な設計とする。

---

## 2. 対象ユーザー
- 個人ユーザー（単一ユーザー）
- マルチデバイス利用（PC・タブレット等）

---

## 3. 対象データ種別
以下の種類を明確に分離して管理する（すべて個人利用前提）。

- Markdown ノート（主要データ）
- RSS 記事（主要データ）
- Web クリップ（将来拡張）
- PDF / File（将来拡張）

---

## 4. 主要機能

### 4.1 共通機能
- Markdown 編集
- 全文検索
- 手動タグ付け
- 双方向リンク
- マルチデバイス同期
- オフライン動作（LLM・RSS 取得を除く）

### 4.2 RSS 機能
- RSS フィード登録
- 手動更新
- RSS 記事の Markdown 化
- ノートとしての編集・タグ・リンク対応

### 4.3 将来拡張（Phase2 以降）
- Web クリップ取り込み
- PDF / File 管理
- LLM による要約・補助
- 自動タグ付け
- エクスポート機能

---

## 5. 技術構成

### 5.1 クライアント
- Web アプリケーション
- フレームワーク：SvelteKit
- 言語：TypeScript
- オフライン対応：Service Worker + IndexedDB

### 5.2 サーバ
- 実行環境：Bun
- Web フレームワーク：Hono
- 言語：TypeScript

### 5.3 データベース
- Turso（SQLite / libSQL 互換）
- SQLite 前提のシンプルなスキーマ設計
- オフライン時はクライアント側 IndexedDB を一次ストレージとして使用

---

## 6. アーキテクチャ

```
[ Web UI (SvelteKit) ]
        |
        v
[ API Server (Bun + Hono) ]
        |
        v
[ Turso (SQLite) ]
```

- フロントエンドから DB への直接接続は行わない
- API を介してすべてのデータ操作を行う

---

## 7. リポジトリ構成

```
pkm/
├─ apps/
│  ├─ web/        # SvelteKit
│  └─ api/        # Bun + Hono
├─ packages/
│  └─ shared/     # 共通型定義
├─ scripts/       # マイグレーション等
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## 8. データモデル

### 8.1 共通ノート

**notes_core**
- id (TEXT, PK)
- type (TEXT)
- title (TEXT)
- created_at (INTEGER)
- updated_at (INTEGER)
- deleted_at (INTEGER, nullable)

---

### 8.2 Markdown ノート

**notes_md**
- note_id (TEXT, PK, FK → notes_core.id)
- content (TEXT)

---

### 8.3 RSS

**rss_feeds**
- id (TEXT, PK)
- url (TEXT, UNIQUE)
- title (TEXT)
- last_fetched_at (INTEGER)

**rss_items**
- note_id (TEXT, PK, FK → notes_core.id)
- feed_id (TEXT, FK → rss_feeds.id)
- url (TEXT)
- content (TEXT)
- published_at (INTEGER)

---

### 8.4 タグ

**tags**
- id (TEXT, PK)
- name (TEXT, UNIQUE)

**note_tags**
- note_id (TEXT, FK)
- tag_id (TEXT, FK)
- PK(note_id, tag_id)

---

### 8.5 双方向リンク

**links**
- from_note_id (TEXT, FK)
- to_note_id (TEXT, FK)
- PK(from_note_id, to_note_id)

---

### 8.6 検索

**notes_fts (FTS5)**
- note_id
- title
- content

---

## 9. API 設計

### 9.1 ノート

```
GET    /notes
POST   /notes
GET    /notes/{id}
PUT    /notes/{id}
DELETE /notes/{id}
```

### 9.2 Markdown

```
POST /notes/md
PUT  /notes/md/{id}
```

### 9.3 RSS

```
POST /rss/feeds
GET  /rss/feeds
POST /rss/fetch
```

### 9.4 タグ

```
GET    /tags
POST   /tags
POST   /notes/{id}/tags
DELETE /notes/{id}/tags/{tag}
```

### 9.5 リンク

```
GET /notes/{id}/links
```

### 9.6 検索

```
GET /search
```

### 9.7 同期

```
GET  /sync/pull
POST /sync/push
```

---

## 10. 同期仕様

- ローカルファースト設計
- updated_at に基づく差分同期
- 単一ユーザー前提
- 最終更新優先（LWW）
- コンフリクトの自動解決・UI 提示は行わない

---

## 11. Phase 1 MVP 範囲

### 含める
- Markdown ノート CRUD
- タグ
- 双方向リンク
- 検索
- RSS（フィード登録・取得・Markdown 化）
- 同期

### 含めない
- Web クリップ
- PDF / File
- LLM 機能
- エクスポート

---

## 12. 非機能要件

- 個人開発・個人運用を前提としたスコープ
- Web アプリのみ（ネイティブアプリ非対応）
- 実装・保守が単独で可能な複雑度に制限
- 将来の Wiki 的公開拡張を阻害しない設計
