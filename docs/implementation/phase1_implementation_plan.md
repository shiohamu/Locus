# Phase1 実装計画

## 1. 概要

Phase1では、個人向けPKM WebアプリケーションのMVP（Minimum Viable Product）を実装する。ローカルファースト設計を前提とし、Markdownノート、RSS、タグ、双方向リンク、検索、同期機能を提供する。

## 2. 実装順序

実装は以下の順序で進める：

1. **基盤構築** - プロジェクト構成、データベーススキーマ、共通型定義
2. **データベース層** - マイグレーション、データアクセス層
3. **API層** - バックエンドAPI実装
4. **フロントエンド基盤** - SvelteKit設定、ルーティング、基本UI
5. **Markdownノート機能** - CRUD操作、エディタ
6. **タグ機能** - タグ管理、ノートへのタグ付け
7. **双方向リンク機能** - リンク検出、表示
8. **検索機能** - 全文検索実装
9. **RSS機能** - フィード登録、取得、Markdown化
10. **同期機能** - ローカルファースト同期
11. **オフライン対応** - Service Worker、IndexedDB

## 3. 詳細実装計画

### 3.1 基盤構築

#### 3.1.1 プロジェクト構成
- [x] モノレポ構成の確認・整備
- [x] `apps/api` - Bun + Hono プロジェクト設定
- [x] `apps/web` - SvelteKit プロジェクト設定
- [x] `packages/shared` - 共通型定義パッケージ設定
- [x] TypeScript設定の統一
- [x] 依存関係の整理

#### 3.1.2 共通型定義 (`packages/shared`)
- [x] `types/note.ts` - ノート関連型定義
  - `NoteCore`, `NoteMD`, `NoteType`
- [x] `types/rss.ts` - RSS関連型定義
  - `RSSFeed`, `RSSItem`
- [x] `types/tag.ts` - タグ関連型定義
  - `Tag`, `NoteTag`
- [x] `types/link.ts` - リンク関連型定義
  - `Link`
- [x] `types/sync.ts` - 同期関連型定義
  - `SyncPullRequest`, `SyncPullResponse`, `SyncPushRequest`
- [x] `types/api.ts` - API共通型定義
  - リクエスト/レスポンス型

#### 3.1.3 データベーススキーマ設計
- [x] SQLiteスキーマ定義の作成
- [x] マイグレーションスクリプトの準備

### 3.2 データベース層

#### 3.2.1 マイグレーション実装 (`scripts/migrations`)
- [x] `001_initial_schema.sql` - 初期スキーマ
  - `notes_core` テーブル
  - `notes_md` テーブル
  - `rss_feeds` テーブル
  - `rss_items` テーブル
  - `tags` テーブル
  - `note_tags` テーブル
  - `links` テーブル
  - `notes_fts` テーブル（FTS5）
  - インデックス定義
  - 外部キー制約

#### 3.2.2 データアクセス層 (`apps/api/src/db`)
- [x] `db.ts` - データベース接続管理
  - Turso接続設定
  - ローカルSQLite接続（開発用）
- [x] `notes.ts` - ノートデータアクセス
  - `createNote()`, `getNote()`, `updateNote()`, `deleteNote()`, `listNotes()`
- [x] `notes_md.ts` - Markdownノートデータアクセス
  - `createNoteMD()`, `getNoteMD()`, `updateNoteMD()`
- [x] `rss.ts` - RSSデータアクセス
  - `createFeed()`, `getFeed()`, `listFeeds()`, `createItem()`, `getItemsByFeed()`
- [x] `tags.ts` - タグデータアクセス
  - `createTag()`, `getTag()`, `listTags()`, `addTagToNote()`, `removeTagFromNote()`, `getTagsByNote()`
- [x] `links.ts` - リンクデータアクセス
  - `createLink()`, `getLinksByNote()`, `deleteLink()`
- [x] `search.ts` - 検索データアクセス
  - `searchNotes()`, `updateFTS()`

### 3.3 API層

#### 3.3.1 API基盤 (`apps/api/src`)
- [x] `index.ts` - Honoアプリケーション初期化
- [x] `middleware/` - ミドルウェア
  - CORS設定
  - エラーハンドリング
  - リクエストログ

#### 3.3.2 ノートAPI (`apps/api/src/routes/notes.ts`)
- [x] `GET /notes` - ノート一覧取得
  - クエリパラメータ: `type`, `limit`, `offset`
- [x] `POST /notes` - ノート作成
- [x] `GET /notes/:id` - ノート取得
- [x] `PUT /notes/:id` - ノート更新
- [x] `DELETE /notes/:id` - ノート削除（論理削除）

#### 3.3.3 MarkdownノートAPI (`apps/api/src/routes/notes_md.ts`)
- [x] `POST /notes/md` - Markdownノート作成
- [x] `PUT /notes/md/:id` - Markdownノート更新

#### 3.3.4 タグAPI (`apps/api/src/routes/tags.ts`)
- [x] `GET /tags` - タグ一覧取得
- [x] `POST /tags` - タグ作成
- [x] `POST /notes/:id/tags` - ノートにタグ追加
- [x] `DELETE /notes/:id/tags/:tag` - ノートからタグ削除

#### 3.3.5 リンクAPI (`apps/api/src/routes/links.ts`)
- [x] `GET /notes/:id/links` - ノートのリンク取得
  - 双方向リンク（from/to両方）を返す

#### 3.3.6 検索API (`apps/api/src/routes/search.ts`)
- [x] `GET /search` - 全文検索
  - クエリパラメータ: `q`, `limit`, `offset`
  - FTS5を使用した検索

#### 3.3.7 RSS API (`apps/api/src/routes/rss.ts`)
- [x] `POST /rss/feeds` - RSSフィード登録
- [x] `GET /rss/feeds` - RSSフィード一覧取得
- [x] `POST /rss/fetch` - RSSフィード取得・更新
  - フィード取得処理
  - RSSパース処理
  - Markdown変換処理
  - ノート作成処理
- [x] `DELETE /rss/feeds/:id` - RSSフィード削除
- [x] `GET /rss/items/:noteId` - RSSアイテム取得

#### 3.3.8 同期API (`apps/api/src/routes/sync.ts`)
- [x] `GET /sync/pull` - サーバーから差分取得
  - クエリパラメータ: `since` (timestamp)
  - `updated_at`に基づく差分返却
- [x] `POST /sync/push` - クライアントから差分送信
  - 最終更新優先（LWW）でマージ

### 3.4 フロントエンド基盤

#### 3.4.1 SvelteKit設定 (`apps/web`)
- [x] `svelte.config.js` - SvelteKit設定確認
- [x] `vite.config.ts` - Vite設定確認
- [x] APIクライアント設定
  - ベースURL設定
  - エラーハンドリング

#### 3.4.2 ルーティング (`apps/web/src/routes`)
- [x] `/` - ホーム（ノート一覧）
- [x] `/notes/[id]` - ノート詳細・編集
- [x] `/notes/new` - ノート作成
- [x] `/tags` - タグ一覧
- [x] `/rss` - RSSフィード管理
- [x] `/search` - 検索結果

#### 3.4.3 共通コンポーネント (`apps/web/src/lib/components`)
- [x] `Layout.svelte` - レイアウトコンポーネント
- [x] `Nav.svelte` - ナビゲーション
- [x] `NoteList.svelte` - ノート一覧表示
- [x] `TagList.svelte` - タグ一覧表示

#### 3.4.4 共通ユーティリティ (`apps/web/src/lib`)
- [x] `api.ts` - APIクライアント関数
- [x] `types.ts` - 型定義（sharedパッケージから再エクスポート）
- [x] `utils.ts` - ユーティリティ関数

### 3.5 Markdownノート機能

#### 3.5.1 ノート一覧 (`apps/web/src/routes/+page.svelte`)
- [x] ノート一覧表示
- [x] フィルタリング（タイプ、タグ）
- [x] ソート（更新日時、作成日時）
- [x] ページネーション

#### 3.5.2 ノートエディタ (`apps/web/src/lib/components/NoteEditor.svelte`)
- [x] Markdownエディタ統合
  - 候補: CodeMirror、Monaco Editor、または軽量なMarkdownエディタ
- [x] プレビュー機能
- [x] 自動保存機能
- [x] タイトル編集

#### 3.5.3 ノート詳細・編集 (`apps/web/src/routes/notes/[id]/+page.svelte`)
- [x] ノート表示
- [x] 編集モード切り替え
- [x] 削除機能

### 3.6 タグ機能

#### 3.6.1 タグ管理 (`apps/web/src/lib/components/TagManager.svelte`)
- [x] タグ一覧表示
- [x] タグ作成
- [x] タグ削除

#### 3.6.2 ノートへのタグ付け (`apps/web/src/lib/components/NoteTags.svelte`)
- [x] ノートに紐づくタグ表示
- [x] タグ追加UI
- [x] タグ削除UI
- [x] タグ候補表示（既存タグから選択）

### 3.7 双方向リンク機能

#### 3.7.1 リンク検出 (`apps/api/src/utils/link-detector.ts`)
- [x] Markdown内のリンク検出
  - `[[note-id]]` 形式の検出
  - `[text](note-id)` 形式の検出
- [x] リンクの自動登録

#### 3.7.2 リンク表示 (`apps/web/src/lib/components/NoteLinks.svelte`)
- [x] 双方向リンク表示
  - このノートからリンクしているノート
  - このノートにリンクしているノート
- [x] リンククリックでノート遷移

### 3.8 検索機能

#### 3.8.1 検索UI (`apps/web/src/routes/search/+page.svelte`)
- [x] 検索フォーム
- [x] 検索結果表示
- [x] ハイライト表示

#### 3.8.2 検索実装 (`apps/api/src/routes/search.ts`)
- [x] FTS5を使用した全文検索
- [x] タイトル・コンテンツ検索
- [x] 検索結果のランキング

### 3.9 RSS機能

#### 3.9.1 RSSフィード管理 (`apps/web/src/routes/rss/+page.svelte`)
- [x] フィード一覧表示
- [x] フィード登録フォーム
- [x] フィード削除
- [x] 手動更新ボタン

#### 3.9.2 RSS取得処理 (`apps/api/src/services/rss-fetcher.ts`)
- [x] RSSフィード取得
- [x] RSSパース（rss-parserライブラリ使用）
- [x] HTML to Markdown変換
  - turndownを使用
- [x] ノート作成処理

#### 3.9.3 RSS記事表示
- [x] RSS記事をノートとして表示
- [x] 元のURL表示
- [x] 公開日時表示

### 3.10 同期機能

#### 3.10.1 同期ロジック (`apps/web/src/lib/sync.ts`)
- [x] ローカルストレージ（IndexedDB）管理
- [x] サーバーとの差分取得（pull）
- [x] サーバーへの差分送信（push）
- [x] コンフリクト解決（LWW）

#### 3.10.2 同期UI
- [x] 同期状態表示
- [x] 手動同期ボタン
- [x] 自動同期（定期的なバックグラウンド同期）

### 3.11 オフライン対応

#### 3.11.1 Service Worker (`apps/web/static/sw.js`)
- [x] Service Worker登録
- [x] キャッシュ戦略
- [x] オフライン時のフォールバック

#### 3.11.2 IndexedDB (`apps/web/src/lib/storage.ts`)
- [x] IndexedDBスキーマ定義
- [x] データ保存・取得関数
- [x] オフライン時のデータ操作
- [x] オンライン復帰時の同期

## 4. 技術的詳細

### 4.1 ID生成
- UUID v4を使用（`crypto.randomUUID()`）
- クライアント側で生成可能

### 4.2 タイムスタンプ
- Unix timestamp（秒単位）を使用
- `Math.floor(Date.now() / 1000)`

### 4.3 リンク形式
- `[[note-id]]` - ウィキスタイルリンク
- `[text](note-id)` - Markdownリンク

### 4.4 エラーハンドリング
- APIエラーは適切なHTTPステータスコードを返す
- フロントエンドでエラーメッセージを表示

### 4.5 バリデーション
- リクエストボディのバリデーション
- 型安全性の確保（TypeScript）

## 5. テスト計画

### 5.1 バックエンドテスト
- [x] データアクセス層のユニットテスト
- [x] APIエンドポイントの統合テスト
- [x] RSS取得処理のテスト

### 5.2 フロントエンドテスト
- [ ] コンポーネントのユニットテスト
- [ ] E2Eテスト（主要フロー）

### 5.3 同期テスト
- [x] 同期ロジックのテスト
- [x] コンフリクト解決のテスト

## 6. 実装チェックリスト

### 基盤
- [x] プロジェクト構成
- [x] 共通型定義
- [x] データベーススキーマ

### データベース層
- [x] マイグレーション
- [x] データアクセス関数

### API層
- [x] ノートAPI
- [x] MarkdownノートAPI
- [x] タグAPI
- [x] リンクAPI
- [x] 検索API
- [x] RSS API
- [x] 同期API

### フロントエンド
- [x] ルーティング
- [x] ノート一覧・詳細・編集
- [x] タグ管理
- [x] リンク表示
- [x] 検索
- [x] RSS管理
- [x] 同期

### オフライン対応
- [x] Service Worker
- [x] IndexedDB

## 7. 依存関係

### バックエンド
- `@libsql/client` - Turso/SQLite接続
- `hono` - Webフレームワーク
- `@hono/node-server` - サーバー実装（必要に応じて）
- `rss-parser` または `feedparser` - RSSパース
- `turndown` または `cheerio` - HTML to Markdown変換

### フロントエンド
- `svelte` / `@sveltejs/kit` - フレームワーク
- `@codemirror/view` / `@codemirror/state` - エディタ（選択）
- `marked` または `markdown-it` - Markdownパース
- `idb` - IndexedDBラッパー

## 8. 注意事項

- すべてのAPIは認証不要（単一ユーザー前提）
- データベース接続は環境変数で管理
- 開発環境ではローカルSQLiteを使用
- 本番環境ではTursoを使用
- オフライン時はIndexedDBを一次ストレージとして使用
- 同期は`updated_at`に基づく差分同期
- コンフリクトは自動解決（LWW）のみ、UI提示なし







