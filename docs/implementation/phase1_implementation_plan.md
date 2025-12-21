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
- [ ] モノレポ構成の確認・整備
- [ ] `apps/api` - Bun + Hono プロジェクト設定
- [ ] `apps/web` - SvelteKit プロジェクト設定
- [ ] `packages/shared` - 共通型定義パッケージ設定
- [ ] TypeScript設定の統一
- [ ] 依存関係の整理

#### 3.1.2 共通型定義 (`packages/shared`)
- [ ] `types/note.ts` - ノート関連型定義
  - `NoteCore`, `NoteMD`, `NoteType`
- [ ] `types/rss.ts` - RSS関連型定義
  - `RSSFeed`, `RSSItem`
- [ ] `types/tag.ts` - タグ関連型定義
  - `Tag`, `NoteTag`
- [ ] `types/link.ts` - リンク関連型定義
  - `Link`
- [ ] `types/sync.ts` - 同期関連型定義
  - `SyncPullRequest`, `SyncPullResponse`, `SyncPushRequest`
- [ ] `types/api.ts` - API共通型定義
  - リクエスト/レスポンス型

#### 3.1.3 データベーススキーマ設計
- [ ] SQLiteスキーマ定義の作成
- [ ] マイグレーションスクリプトの準備

### 3.2 データベース層

#### 3.2.1 マイグレーション実装 (`scripts/migrations`)
- [ ] `001_initial_schema.sql` - 初期スキーマ
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
- [ ] `db.ts` - データベース接続管理
  - Turso接続設定
  - ローカルSQLite接続（開発用）
- [ ] `notes.ts` - ノートデータアクセス
  - `createNote()`, `getNote()`, `updateNote()`, `deleteNote()`, `listNotes()`
- [ ] `notes_md.ts` - Markdownノートデータアクセス
  - `createNoteMD()`, `getNoteMD()`, `updateNoteMD()`
- [ ] `rss.ts` - RSSデータアクセス
  - `createFeed()`, `getFeed()`, `listFeeds()`, `createItem()`, `getItemsByFeed()`
- [ ] `tags.ts` - タグデータアクセス
  - `createTag()`, `getTag()`, `listTags()`, `addTagToNote()`, `removeTagFromNote()`, `getTagsByNote()`
- [ ] `links.ts` - リンクデータアクセス
  - `createLink()`, `getLinksByNote()`, `deleteLink()`
- [ ] `search.ts` - 検索データアクセス
  - `searchNotes()`, `updateFTS()`

### 3.3 API層

#### 3.3.1 API基盤 (`apps/api/src`)
- [ ] `index.ts` - Honoアプリケーション初期化
- [ ] `middleware/` - ミドルウェア
  - CORS設定
  - エラーハンドリング
  - リクエストログ

#### 3.3.2 ノートAPI (`apps/api/src/routes/notes.ts`)
- [ ] `GET /notes` - ノート一覧取得
  - クエリパラメータ: `type`, `limit`, `offset`
- [ ] `POST /notes` - ノート作成
- [ ] `GET /notes/:id` - ノート取得
- [ ] `PUT /notes/:id` - ノート更新
- [ ] `DELETE /notes/:id` - ノート削除（論理削除）

#### 3.3.3 MarkdownノートAPI (`apps/api/src/routes/notes_md.ts`)
- [ ] `POST /notes/md` - Markdownノート作成
- [ ] `PUT /notes/md/:id` - Markdownノート更新

#### 3.3.4 タグAPI (`apps/api/src/routes/tags.ts`)
- [ ] `GET /tags` - タグ一覧取得
- [ ] `POST /tags` - タグ作成
- [ ] `POST /notes/:id/tags` - ノートにタグ追加
- [ ] `DELETE /notes/:id/tags/:tag` - ノートからタグ削除

#### 3.3.5 リンクAPI (`apps/api/src/routes/links.ts`)
- [ ] `GET /notes/:id/links` - ノートのリンク取得
  - 双方向リンク（from/to両方）を返す

#### 3.3.6 検索API (`apps/api/src/routes/search.ts`)
- [ ] `GET /search` - 全文検索
  - クエリパラメータ: `q`, `limit`, `offset`
  - FTS5を使用した検索

#### 3.3.7 RSS API (`apps/api/src/routes/rss.ts`)
- [ ] `POST /rss/feeds` - RSSフィード登録
- [ ] `GET /rss/feeds` - RSSフィード一覧取得
- [ ] `POST /rss/fetch` - RSSフィード取得・更新
  - フィード取得処理
  - RSSパース処理
  - Markdown変換処理
  - ノート作成処理

#### 3.3.8 同期API (`apps/api/src/routes/sync.ts`)
- [ ] `GET /sync/pull` - サーバーから差分取得
  - クエリパラメータ: `since` (timestamp)
  - `updated_at`に基づく差分返却
- [ ] `POST /sync/push` - クライアントから差分送信
  - 最終更新優先（LWW）でマージ

### 3.4 フロントエンド基盤

#### 3.4.1 SvelteKit設定 (`apps/web`)
- [ ] `svelte.config.js` - SvelteKit設定確認
- [ ] `vite.config.ts` - Vite設定確認
- [ ] APIクライアント設定
  - ベースURL設定
  - エラーハンドリング

#### 3.4.2 ルーティング (`apps/web/src/routes`)
- [ ] `/` - ホーム（ノート一覧）
- [ ] `/notes/[id]` - ノート詳細・編集
- [ ] `/notes/new` - ノート作成
- [ ] `/tags` - タグ一覧
- [ ] `/rss` - RSSフィード管理
- [ ] `/search` - 検索結果

#### 3.4.3 共通コンポーネント (`apps/web/src/lib/components`)
- [ ] `Layout.svelte` - レイアウトコンポーネント
- [ ] `Nav.svelte` - ナビゲーション
- [ ] `NoteList.svelte` - ノート一覧表示
- [ ] `TagList.svelte` - タグ一覧表示

#### 3.4.4 共通ユーティリティ (`apps/web/src/lib`)
- [ ] `api.ts` - APIクライアント関数
- [ ] `types.ts` - 型定義（sharedパッケージから再エクスポート）
- [ ] `utils.ts` - ユーティリティ関数

### 3.5 Markdownノート機能

#### 3.5.1 ノート一覧 (`apps/web/src/routes/+page.svelte`)
- [ ] ノート一覧表示
- [ ] フィルタリング（タイプ、タグ）
- [ ] ソート（更新日時、作成日時）
- [ ] ページネーション

#### 3.5.2 ノートエディタ (`apps/web/src/lib/components/NoteEditor.svelte`)
- [ ] Markdownエディタ統合
  - 候補: CodeMirror、Monaco Editor、または軽量なMarkdownエディタ
- [ ] プレビュー機能
- [ ] 自動保存機能
- [ ] タイトル編集

#### 3.5.3 ノート詳細・編集 (`apps/web/src/routes/notes/[id]/+page.svelte`)
- [ ] ノート表示
- [ ] 編集モード切り替え
- [ ] 削除機能

### 3.6 タグ機能

#### 3.6.1 タグ管理 (`apps/web/src/lib/components/TagManager.svelte`)
- [ ] タグ一覧表示
- [ ] タグ作成
- [ ] タグ削除

#### 3.6.2 ノートへのタグ付け (`apps/web/src/lib/components/NoteTags.svelte`)
- [ ] ノートに紐づくタグ表示
- [ ] タグ追加UI
- [ ] タグ削除UI
- [ ] タグ候補表示（既存タグから選択）

### 3.7 双方向リンク機能

#### 3.7.1 リンク検出 (`apps/api/src/utils/link-detector.ts`)
- [ ] Markdown内のリンク検出
  - `[[note-id]]` 形式の検出
  - `[text](note-id)` 形式の検出
- [ ] リンクの自動登録

#### 3.7.2 リンク表示 (`apps/web/src/lib/components/NoteLinks.svelte`)
- [ ] 双方向リンク表示
  - このノートからリンクしているノート
  - このノートにリンクしているノート
- [ ] リンククリックでノート遷移

### 3.8 検索機能

#### 3.8.1 検索UI (`apps/web/src/routes/search/+page.svelte`)
- [ ] 検索フォーム
- [ ] 検索結果表示
- [ ] ハイライト表示

#### 3.8.2 検索実装 (`apps/api/src/routes/search.ts`)
- [ ] FTS5を使用した全文検索
- [ ] タイトル・コンテンツ検索
- [ ] 検索結果のランキング

### 3.9 RSS機能

#### 3.9.1 RSSフィード管理 (`apps/web/src/routes/rss/+page.svelte`)
- [ ] フィード一覧表示
- [ ] フィード登録フォーム
- [ ] フィード削除
- [ ] 手動更新ボタン

#### 3.9.2 RSS取得処理 (`apps/api/src/services/rss-fetcher.ts`)
- [ ] RSSフィード取得
- [ ] RSSパース（feedparser等のライブラリ使用）
- [ ] HTML to Markdown変換
  - 候補: turndown、cheerio + カスタム変換
- [ ] ノート作成処理

#### 3.9.3 RSS記事表示
- [ ] RSS記事をノートとして表示
- [ ] 元のURL表示
- [ ] 公開日時表示

### 3.10 同期機能

#### 3.10.1 同期ロジック (`apps/web/src/lib/sync.ts`)
- [ ] ローカルストレージ（IndexedDB）管理
- [ ] サーバーとの差分取得（pull）
- [ ] サーバーへの差分送信（push）
- [ ] コンフリクト解決（LWW）

#### 3.10.2 同期UI
- [ ] 同期状態表示
- [ ] 手動同期ボタン
- [ ] 自動同期（定期的なバックグラウンド同期）

### 3.11 オフライン対応

#### 3.11.1 Service Worker (`apps/web/static/sw.js`)
- [ ] Service Worker登録
- [ ] キャッシュ戦略
- [ ] オフライン時のフォールバック

#### 3.11.2 IndexedDB (`apps/web/src/lib/storage.ts`)
- [ ] IndexedDBスキーマ定義
- [ ] データ保存・取得関数
- [ ] オフライン時のデータ操作
- [ ] オンライン復帰時の同期

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
- [ ] データアクセス層のユニットテスト
- [ ] APIエンドポイントの統合テスト
- [ ] RSS取得処理のテスト

### 5.2 フロントエンドテスト
- [ ] コンポーネントのユニットテスト
- [ ] E2Eテスト（主要フロー）

### 5.3 同期テスト
- [ ] 同期ロジックのテスト
- [ ] コンフリクト解決のテスト

## 6. 実装チェックリスト

### 基盤
- [ ] プロジェクト構成
- [ ] 共通型定義
- [ ] データベーススキーマ

### データベース層
- [ ] マイグレーション
- [ ] データアクセス関数

### API層
- [ ] ノートAPI
- [ ] MarkdownノートAPI
- [ ] タグAPI
- [ ] リンクAPI
- [ ] 検索API
- [ ] RSS API
- [ ] 同期API

### フロントエンド
- [ ] ルーティング
- [ ] ノート一覧・詳細・編集
- [ ] タグ管理
- [ ] リンク表示
- [ ] 検索
- [ ] RSS管理
- [ ] 同期

### オフライン対応
- [ ] Service Worker
- [ ] IndexedDB

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






