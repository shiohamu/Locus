# Locus 機能改善計画

作成日: 2025-12-29

このドキュメントは、Locusプロジェクトの機能改善に関する詳細な計画を記載します。

## 目次

1. [ホームタブのソートにタグでのソートを追加](#1-ホームタブのソートにタグでのソートを追加)
2. [ホームタブにアクセス時に必ず一覧の更新](#2-ホームタブにアクセス時に必ず一覧の更新)
3. [ホームタブでの一括削除機能](#3-ホームタブでの一括削除機能)
4. [新規ノートタブでのタグ追加機能](#4-新規ノートタブでのタグ追加機能)
5. [タグ一覧からのタグ選択時にそのタグが付いたノートの一覧表示機能](#5-タグ一覧からのタグ選択時にそのタグが付いたノートの一覧表示機能)
6. [RSSフィードの取得内容の最適化](#6-rssフィードの取得内容の最適化)
7. [RSSフィードの取得内容編集機能](#7-rssフィードの取得内容編集機能)
8. [ファイルのノート埋め込み機能](#8-ファイルのノート埋め込み機能)
9. [ファイルのノート一覧への表示オンオフ機能](#9-ファイルのノート一覧への表示オンオフ機能)
10. [エクスポート機能の最適化](#10-エクスポート機能の最適化)

---

## 1. ホームタブのソートにタグでのソートを追加

### 現状
- ホームタブ（`apps/web/src/routes/+page.svelte`）では、`updated_at`, `created_at`, `title` でのソートが可能
- タグでのソート機能は未実装

### 実装内容

#### 1.1 バックエンド（API）
- **ファイル**: `apps/api/src/db/notes.ts`
- **変更内容**:
  - `listNotes()` 関数に `sortBy` パラメータを追加（既存の実装を確認）
  - タグ名でのソートをサポートするSQLクエリを追加
  - タグが複数ある場合は、最初のタグ名でソート

#### 1.2 フロントエンド（ストア）
- **ファイル**: `apps/web/src/lib/stores/notes.ts`
- **変更内容**:
  - `SortBy` 型に `"tag"` を追加
  - `sortNotes()` 関数（`apps/web/src/lib/services/sorting.ts`）にタグソートロジックを追加
  - タグ情報を取得する必要があるため、ノート取得時にタグ情報も含める

#### 1.3 フロントエンド（UI）
- **ファイル**: `apps/web/src/routes/+page.svelte`
- **変更内容**:
  - ソート選択に「タグ」オプションを追加
  - タグソート時は、ノートに紐づく最初のタグ名でソート

#### 1.4 依存関係
- ノート取得時にタグ情報も取得する必要がある
- `apps/web/src/lib/api/notes.ts` の `getNotes()` を拡張
- または、ノート取得後にタグ情報を別途取得してマージ

### 実装ステップ
1. `SortBy` 型に `"tag"` を追加
2. ノート取得時にタグ情報も取得するAPIを確認・拡張
3. `sortNotes()` 関数にタグソートロジックを実装
4. UIにタグソートオプションを追加
5. テストを追加

---

## 2. ホームタブにアクセス時に必ず一覧の更新

### 現状
- `apps/web/src/routes/+page.svelte` の `onMount` で `notesStore.loadNotes()` を呼び出している
- ただし、ページ遷移時に再読み込みされない可能性がある

### 実装内容

#### 2.1 フロントエンド（ページ）
- **ファイル**: `apps/web/src/routes/+page.svelte`
- **変更内容**:
  - `onMount` だけでなく、ページアクセス時にも確実に更新されるようにする
  - SvelteKitの `beforeNavigate` または `afterNavigate` を使用
  - または、`$app/stores` の `page` ストアを監視して、ホームページに遷移した際に更新

#### 2.2 実装方法
```typescript
import { onMount } from "svelte";
import { page } from "$app/stores";

// 方法1: beforeNavigate/afterNavigateを使用
import { beforeNavigate, afterNavigate } from "$app/navigation";

afterNavigate(() => {
  if ($page.url.pathname === "/") {
    notesStore.loadNotes();
  }
});

// 方法2: pageストアを監視
$: if ($page.url.pathname === "/") {
  notesStore.loadNotes();
}
```

### 実装ステップ
1. `afterNavigate` または `page` ストア監視を実装
2. ホームページ（`/`）にアクセスした際に `loadNotes()` を呼び出す
3. 無限ループを防ぐためのフラグ管理を追加（必要に応じて）
4. テストを追加

---

## 3. ホームタブでの一括削除機能

### 現状
- 個別ノートの削除機能は実装済み（`apps/web/src/routes/notes/[id]/+page.svelte`）
- 一括削除機能は未実装

### 実装内容

#### 3.1 バックエンド（API）
- **ファイル**: `apps/api/src/routes/notes.ts`
- **変更内容**:
  - `DELETE /notes/batch` エンドポイントを追加
  - リクエストボディ: `{ note_ids: string[] }`
  - 複数のノートIDを受け取り、一括削除を実行

#### 3.2 バックエンド（DB）
- **ファイル**: `apps/api/src/db/notes.ts`
- **変更内容**:
  - `deleteNotesBatch()` 関数を追加
  - トランザクションを使用して安全に削除

#### 3.3 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/notes.ts`
- **変更内容**:
  - `deleteNotesBatch()` 関数を追加

#### 3.4 フロントエンド（UI）
- **ファイル**: `apps/web/src/routes/+page.svelte`
- **変更内容**:
  - チェックボックスを追加してノートを選択可能にする
  - 「選択したノートを削除」ボタンを追加
  - 削除確認ダイアログを表示
  - 削除後、一覧を更新

#### 3.5 フロントエンド（コンポーネント）
- **ファイル**: `apps/web/src/lib/components/NoteList.svelte`
- **変更内容**:
  - チェックボックス表示を追加
  - 選択状態を親コンポーネントに通知

### 実装ステップ
1. バックエンドに一括削除APIを実装
2. フロントエンドAPI関数を追加
3. `NoteList` コンポーネントにチェックボックスを追加
4. ホームページに一括削除UIを追加
5. 削除確認ダイアログを実装
6. テストを追加

---

## 4. 新規ノートタブでのタグ追加機能（新規、既存）

### 現状
- 新規ノート作成ページ（`apps/web/src/routes/notes/new/+page.svelte`）にはタグ追加機能がない
- タグ管理機能は実装済み（`apps/web/src/routes/tags/+page.svelte`）

### 実装内容

#### 4.1 フロントエンド（コンポーネント）
- **ファイル**: 新規作成 `apps/web/src/lib/components/TagSelector.svelte`
- **変更内容**:
  - 既存タグの選択UI（マルチセレクトまたはチェックボックス）
  - 新規タグ作成UI（入力フィールド + 作成ボタン）
  - 選択されたタグの表示（チップ形式）

#### 4.2 フロントエンド（ページ）
- **ファイル**: `apps/web/src/routes/notes/new/+page.svelte`
- **変更内容**:
  - `TagSelector` コンポーネントを追加
  - 選択されたタグIDを保持
  - ノート作成時にタグも関連付け

#### 4.3 バックエンド（API）
- **ファイル**: `apps/api/src/routes/notes_md.ts`
- **変更内容**:
  - ノート作成時にタグも関連付ける処理を追加
  - または、別エンドポイントでタグ関連付けを行う

#### 4.4 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/notes.ts`
- **変更内容**:
  - ノート作成時にタグも送信するように修正

### 実装ステップ
1. `TagSelector` コンポーネントを作成
2. 新規ノート作成ページに `TagSelector` を追加
3. ノート作成APIを拡張してタグも送信
4. バックエンドでタグ関連付け処理を実装
5. テストを追加

---

## 5. タグ一覧からのタグ選択時にそのタグが付いたノートの一覧表示機能

### 現状
- タグ一覧ページ（`apps/web/src/routes/tags/+page.svelte`）は存在するが、タグクリック時の動作がない
- タグでフィルタリングするAPIは実装済み（`apps/api/src/db/notes.ts` の `listNotesByTags()`）

### 実装内容

#### 5.1 フロントエンド（ページ）
- **ファイル**: `apps/web/src/routes/tags/+page.svelte`
- **変更内容**:
  - タグをクリック可能にする
  - クリック時にホームページに遷移し、そのタグでフィルタリング
  - または、専用のタグフィルターページ（`/tags/[tagName]`）を作成

#### 5.2 フロントエンド（ストア）
- **ファイル**: `apps/web/src/lib/stores/notes.ts`
- **変更内容**:
  - タグフィルター機能を追加
  - `setTagFilter()` メソッドを追加

#### 5.3 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/notes.ts`
- **変更内容**:
  - `getNotesByTags()` 関数を追加（既存のAPIを利用）

#### 5.4 バックエンド（API）
- **ファイル**: `apps/api/src/routes/notes.ts`
- **変更内容**:
  - `GET /notes?tags=tag1,tag2` クエリパラメータをサポート
  - 既存の `listNotesByTags()` を使用

### 実装ステップ
1. タグ一覧ページでタグをクリック可能にする
2. タグクリック時にホームページに遷移し、タグフィルターを適用
3. ホームページでタグフィルターを表示・操作できるUIを追加
4. テストを追加

---

## 6. RSSフィードの取得内容の最適化

### 現状
- RSS取得機能は実装済み（`apps/api/src/services/rss-fetcher.ts`）
- `turndown` を使用してHTMLをMarkdownに変換しているが、最適化は不十分

### 実装内容

#### 6.1 バックエンド（サービス）
- **ファイル**: `apps/api/src/services/rss-fetcher.ts`
- **変更内容**:
  - `cheerio` を使用してHTMLをパース
  - 不要な要素（広告、ナビゲーション、フッターなど）を除去
  - メインコンテンツのみを抽出
  - `turndown` の設定を最適化（コードブロック、テーブルなどの保持）

#### 6.2 実装詳細
```typescript
import * as cheerio from "cheerio";

// HTMLからメインコンテンツを抽出
function extractMainContent(html: string): string {
  const $ = cheerio.load(html);

  // 不要な要素を除去
  $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

  // メインコンテンツを抽出（article, main, .content など）
  const mainContent = $('article, main, .content, .post-content').first();

  return mainContent.length > 0 ? mainContent.html() || html : html;
}
```

#### 6.3 設定ファイル
- **ファイル**: `apps/api/src/services/rss-fetcher.ts`
- **変更内容**:
  - `TurndownService` の設定を最適化
  - コードブロック、テーブル、画像などの保持

### 実装ステップ
1. `cheerio` を使用したHTMLパース処理を追加
2. 不要な要素の除去ロジックを実装
3. メインコンテンツ抽出ロジックを実装
4. `turndown` の設定を最適化
5. テストを追加

---

## 7. RSSフィードの取得内容編集機能

### 現状
- RSSアイテムは取得後、編集できない
- RSSアイテムのコンテンツは `apps/api/src/db/rss.ts` で管理されている

### 実装内容

#### 7.1 バックエンド（DB）
- **ファイル**: `apps/api/src/db/rss.ts`
- **変更内容**:
  - `updateItem()` 関数を追加
  - RSSアイテムの `content` を更新可能にする

#### 7.2 バックエンド（API）
- **ファイル**: `apps/api/src/routes/rss.ts`
- **変更内容**:
  - `PUT /rss/items/:noteId` エンドポイントを追加
  - リクエストボディ: `{ content: string }`
  - RSSアイテムのコンテンツを更新

#### 7.3 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/rss.ts`
- **変更内容**:
  - `updateRSSItem()` 関数を追加

#### 7.4 フロントエンド（ページ）
- **ファイル**: `apps/web/src/routes/notes/[id]/+page.svelte`
- **変更内容**:
  - RSSノートの場合、編集モードを追加
  - コンテンツを編集可能にする
  - 保存時に `updateRSSItem()` を呼び出す

### 実装ステップ
1. バックエンドにRSSアイテム更新APIを実装
2. フロントエンドAPI関数を追加
3. ノート詳細ページでRSSノートの編集機能を追加
4. テストを追加

---

## 8. ファイルのノート埋め込み機能

### 現状
- ファイルとノートの関連付けAPIは実装済み（`apps/api/src/routes/files.ts`）
- ノート編集時にファイルを埋め込むUIがない

### 実装内容

#### 8.1 フロントエンド（コンポーネント）
- **ファイル**: 新規作成 `apps/web/src/lib/components/FileEmbedder.svelte`
- **変更内容**:
  - ファイル選択UI
  - 埋め込み済みファイルの表示
  - ファイルの削除機能

#### 8.2 フロントエンド（ページ）
- **ファイル**: `apps/web/src/routes/notes/[id]/+page.svelte`
- **変更内容**:
  - `FileEmbedder` コンポーネントを追加
  - ノートに紐づくファイルを表示
  - ファイル追加・削除機能

#### 8.3 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/files.ts`
- **変更内容**:
  - `linkFileToNote()`, `unlinkFileFromNote()` は既に実装済み
  - `getFilesByNote()` 関数を追加（既存のAPIを利用）

#### 8.4 バックエンド（API）
- **ファイル**: `apps/api/src/routes/files.ts`
- **変更内容**:
  - `GET /files?note_id=xxx` エンドポイントを追加
  - ノートに紐づくファイル一覧を取得

### 実装ステップ
1. `FileEmbedder` コンポーネントを作成
2. ノート詳細ページに `FileEmbedder` を追加
3. ファイル一覧取得APIを実装（必要に応じて）
4. ファイル埋め込み・削除機能を実装
5. テストを追加

---

## 9. ファイルのノート一覧への表示オンオフ機能

### 現状
- ファイル一覧ページは存在する（`apps/web/src/routes/files/+page.svelte`）
- ノート一覧にファイルを表示する機能がない

### 実装内容

#### 9.1 データモデル
- **ファイル**: `packages/shared/src/types/file.ts`
- **変更内容**:
  - `File` インターフェースに `show_in_notes: boolean` フィールドを追加

#### 9.2 データベース
- **ファイル**: 新規作成 `scripts/migrations/004_add_file_show_in_notes.sql`
- **変更内容**:
  - `files` テーブルに `show_in_notes` カラムを追加（デフォルト: `false`）

#### 9.3 バックエンド（DB）
- **ファイル**: `apps/api/src/db/files.ts`
- **変更内容**:
  - `updateFile()` 関数を追加
  - `show_in_notes` フィールドを更新可能にする

#### 9.4 バックエンド（API）
- **ファイル**: `apps/api/src/routes/files.ts`
- **変更内容**:
  - `PUT /files/:id` エンドポイントを追加
  - `show_in_notes` を更新

#### 9.5 バックエンド（ノート取得）
- **ファイル**: `apps/api/src/db/notes.ts` または `apps/api/src/routes/notes.ts`
- **変更内容**:
  - ノート一覧取得時に `show_in_notes=true` のファイルも含める
  - または、別エンドポイントでファイル付きノートを取得

#### 9.6 フロントエンド（API）
- **ファイル**: `apps/web/src/lib/api/files.ts`
- **変更内容**:
  - `updateFile()` 関数を追加

#### 9.7 フロントエンド（UI）
- **ファイル**: `apps/web/src/routes/files/+page.svelte`
- **変更内容**:
  - 各ファイルに「ノート一覧に表示」トグルを追加
  - トグル変更時に `updateFile()` を呼び出す

#### 9.8 フロントエンド（ノート一覧）
- **ファイル**: `apps/web/src/routes/+page.svelte` または `apps/web/src/lib/components/NoteList.svelte`
- **変更内容**:
  - `show_in_notes=true` のファイルをノート一覧に表示
  - ファイルカードを表示

### 実装ステップ
1. データベースマイグレーションを作成
2. `File` 型に `show_in_notes` を追加
3. バックエンドにファイル更新APIを実装
4. フロントエンドAPI関数を追加
5. ファイル一覧ページにトグルを追加
6. ノート一覧にファイル表示機能を追加
7. テストを追加

---

## 10. エクスポート機能の最適化

### 現状
- Markdownエクスポート（`apps/api/src/services/export/markdown.ts`）
- JSONエクスポート（`apps/api/src/services/export/json.ts`）
- 静的HTMLエクスポート（`apps/api/src/services/export/static-html.ts`）

### 実装内容

#### 10.1 パフォーマンス最適化
- **ファイル**: `apps/api/src/services/export/markdown.ts`, `apps/api/src/services/export/json.ts`
- **変更内容**:
  - 大量データの処理を最適化（バッチ処理、ストリーミング）
  - メモリ使用量を削減
  - 非同期処理の並列化

#### 10.2 オプション追加
- **ファイル**: `apps/api/src/routes/export.ts`
- **変更内容**:
  - エクスポート対象の選択（ノートタイプ、タグ、日付範囲など）
  - ファイルを含める/含めないオプション
  - 圧縮オプション（ZIP圧縮レベル）

#### 10.3 進捗表示
- **ファイル**: `apps/api/src/routes/export.ts`
- **変更内容**:
  - WebSocketまたはServer-Sent Events (SSE) で進捗を通知
  - または、ポーリングで進捗を取得

#### 10.4 フロントエンド（UI）
- **ファイル**: `apps/web/src/routes/settings/+page.svelte` または新規作成 `apps/web/src/lib/components/ExportDialog.svelte`
- **変更内容**:
  - エクスポートオプション選択UI
  - 進捗表示
  - ダウンロードリンク

#### 10.5 エラーハンドリング
- **ファイル**: 各エクスポートサービス
- **変更内容**:
  - 詳細なエラーメッセージ
  - 部分的なエクスポート失敗時の処理

### 実装ステップ
1. エクスポート処理のパフォーマンスを分析
2. バッチ処理・ストリーミングを実装
3. エクスポートオプションを追加
4. 進捗表示機能を実装（必要に応じて）
5. エラーハンドリングを改善
6. フロントエンドUIを改善
7. テストを追加

---

## 実装優先順位

### フェーズ1（高優先度・基盤機能）
1. **ホームタブにアクセス時に必ず一覧の更新** - ユーザー体験の基本
2. **新規ノートタブでのタグ追加機能** - ノート作成時の必須機能
3. **タグ一覧からのタグ選択時にそのタグが付いたノートの一覧表示機能** - タグ機能の完成

### フェーズ2（中優先度・操作性向上）
4. **ホームタブのソートにタグでのソートを追加** - ソート機能の拡張
5. **ホームタブでの一括削除機能** - 効率的な管理機能
6. **RSSフィードの取得内容の最適化** - データ品質向上

### フェーズ3（低優先度・高度な機能）
7. **RSSフィードの取得内容編集機能** - 柔軟性向上
8. **ファイルのノート埋め込み機能** - ファイル管理の完成
9. **ファイルのノート一覧への表示オンオフ機能** - 表示制御
10. **エクスポート機能の最適化** - パフォーマンス・機能拡張

---

## 技術的な考慮事項

### データベース
- マイグレーションが必要な機能:
  - ファイルの `show_in_notes` フィールド追加（機能9）

### API設計
- 一括操作APIの追加（機能3）
- タグフィルターAPIの拡張（機能5）
- ファイル更新APIの追加（機能9）

### フロントエンド
- 新しいコンポーネント:
  - `TagSelector.svelte`（機能4）
  - `FileEmbedder.svelte`（機能8）
  - `ExportDialog.svelte`（機能10、既存の可能性あり）

### パフォーマンス
- 大量データの処理（機能10）
- ノート一覧の更新頻度（機能2）

---

## テスト計画

各機能について、以下をテストする必要があります：

1. **ユニットテスト**
   - バックエンドの各関数・メソッド
   - フロントエンドの各関数・コンポーネント

2. **統合テスト**
   - APIエンドポイントの動作確認
   - フロントエンドとバックエンドの連携

3. **E2Eテスト**
   - ユーザー操作フローの確認
   - Playwrightを使用したテスト

---

## 関連ドキュメント

- [API仕様書](./api.md)
- [実装計画 Phase 1](./implementation/phase1_implementation_plan.md)
- [実装計画 Phase 2](./implementation/phase2_implementation_plan.md)

---

*このドキュメントは改善計画の概要です。実装時には、各機能の詳細設計を行い、段階的に実装を進めてください。*

