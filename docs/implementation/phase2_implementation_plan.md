# Phase2 実装計画

## 1. 概要

Phase2では、Phase1で構築した基盤の上に、Webクリップ、PDF/File管理、エクスポート機能を追加する。Phase1の設計を尊重し、既存機能への影響を最小限に抑えながら実装する。

## 2. 実装順序

1. **Webクリップ機能** - URL登録、HTML取得、Markdown変換
2. **PDF/File管理機能** - ファイルアップロード、メタデータ管理
3. **エクスポート機能** - Markdown/JSONエクスポート

## 3. 詳細実装計画

### 3.1 Webクリップ機能

#### 3.1.1 データベーススキーマ拡張
- [x] `scripts/migrations/002_add_web_clips.sql`
  - `web_clips` テーブル作成
    - `note_id` (TEXT, PK, FK → notes_core.id)
    - `source_url` (TEXT)
    - `fetched_at` (INTEGER)
    - `content` (TEXT)
  - インデックス追加

#### 3.1.2 データアクセス層 (`apps/api/src/db/web-clips.ts`)
- [x] `createWebClip()` - Webクリップ作成
- [x] `getWebClip()` - Webクリップ取得
- [x] `updateWebClip()` - Webクリップ更新
- [x] `listWebClips()` - Webクリップ一覧取得

#### 3.1.3 Webクリップ取得サービス (`apps/api/src/services/web-clip-fetcher.ts`)
- [x] URLからHTML取得
  - ユーザーエージェント設定
  - タイムアウト処理
  - エラーハンドリング
- [x] HTML to Markdown変換
  - Phase1のRSS機能と同様の変換ロジックを再利用
  - メタデータ抽出（title, description等）
- [x] ノート作成処理
  - `notes_core`に`type='web_clip'`で作成
  - `web_clips`テーブルに保存

#### 3.1.4 WebクリップAPI (`apps/api/src/routes/web-clips.ts`)
- [x] `POST /web-clips` - Webクリップ作成
  - リクエスト: `{ url: string }`
  - レスポンス: 作成されたノート情報
- [x] `GET /web-clips` - Webクリップ一覧取得
- [x] `GET /web-clips/:id` - Webクリップ取得
- [x] `PUT /web-clips/:id` - Webクリップ更新（再取得）
- [x] `DELETE /web-clips/:id` - Webクリップ削除

#### 3.1.5 フロントエンド実装
- [x] `apps/web/src/routes/web-clips/+page.svelte` - Webクリップ一覧
- [x] `apps/web/src/lib/components/WebClipForm.svelte` - URL登録フォーム（一覧ページに統合）
- [x] `apps/web/src/lib/components/WebClipCard.svelte` - Webクリップ表示（一覧ページに統合）
- [x] ノート詳細ページでWebクリップの元URL表示

#### 3.1.6 共通型定義追加 (`packages/shared/src/types/web-clip.ts`)
- [x] `WebClip` 型定義

### 3.2 PDF/File管理機能

#### 3.2.1 データベーススキーマ拡張
- [x] `scripts/migrations/003_add_files.sql`
  - `files` テーブル作成
    - `id` (TEXT, PK)
    - `filename` (TEXT)
    - `mime_type` (TEXT)
    - `size` (INTEGER)
    - `created_at` (INTEGER)
  - `file_notes` テーブル作成
    - `file_id` (TEXT, FK → files.id)
    - `note_id` (TEXT, FK → notes_core.id)
    - PK(file_id, note_id)
  - インデックス追加

#### 3.2.2 ファイルストレージ
- [x] ファイル保存先の決定
  - ローカルファイルシステム（開発環境）
  - オブジェクトストレージ（本番環境、将来拡張）
- [x] ファイル保存パスの設計
  - `files/{id}/{filename}` 形式を想定

#### 3.2.3 データアクセス層 (`apps/api/src/db/files.ts`)
- [x] `createFile()` - ファイルメタデータ作成
- [x] `getFile()` - ファイルメタデータ取得
- [x] `listFiles()` - ファイル一覧取得
- [x] `deleteFile()` - ファイル削除
- [x] `linkFileToNote()` - ノートとファイルの関連付け
- [x] `unlinkFileFromNote()` - ノートとファイルの関連解除
- [x] `getFilesByNote()` - ノートに紐づくファイル取得
- [x] `getNotesByFile()` - ファイルに紐づくノート取得

#### 3.2.4 ファイルアップロード処理 (`apps/api/src/services/file-uploader.ts`)
- [x] ファイルアップロード処理
  - ファイルサイズ制限
  - MIMEタイプ検証
  - ファイル名のサニタイズ
- [x] ファイル保存処理
- [x] メタデータ抽出

#### 3.2.5 ファイルAPI (`apps/api/src/routes/files.ts`)
- [x] `POST /files` - ファイルアップロード
  - multipart/form-data対応
  - レスポンス: ファイルメタデータ
- [x] `GET /files` - ファイル一覧取得
- [x] `GET /files/:id` - ファイルメタデータ取得
- [x] `GET /files/:id/download` - ファイルダウンロード
- [x] `DELETE /files/:id` - ファイル削除
- [x] `POST /files/:id/notes` - ノートとファイルの関連付け
- [x] `DELETE /files/:id/notes/:noteId` - ノートとファイルの関連解除

#### 3.2.6 フロントエンド実装
- [x] `apps/web/src/routes/files/+page.svelte` - ファイル一覧
- [x] `apps/web/src/lib/components/FileUploader.svelte` - ファイルアップロードUI（一覧ページに統合）
- [x] `apps/web/src/lib/components/FileList.svelte` - ファイル一覧表示（一覧ページに統合）
- [ ] ノート詳細ページでファイル添付機能（将来実装）
- [ ] ファイルプレビュー機能（PDF、画像等）（将来実装）

#### 3.2.7 共通型定義追加 (`packages/shared/src/types/file.ts`)
- [x] `File` 型定義
- [x] `FileNote` 型定義

### 3.3 エクスポート機能

#### 3.3.1 Markdownエクスポート (`apps/api/src/services/export/markdown.ts`)
- [x] 全ノートのMarkdownエクスポート
  - ノートごとにファイル生成
  - ファイル名: `{note-id}.md` または `{title}.md`
  - メタデータ（タグ、リンク）をYAML frontmatterに含める
- [x] ZIP形式での一括ダウンロード
- [x] フィルタリング対応（タイプ、タグ）

#### 3.3.2 JSONエクスポート (`apps/api/src/services/export/json.ts`)
- [x] 全データのJSONエクスポート
  - ノート、タグ、リンク、RSS、Webクリップ、ファイルメタデータ
  - 構造化されたJSON形式
  - 他PKMツールへの移行を想定した形式

#### 3.3.3 エクスポートAPI (`apps/api/src/routes/export.ts`)
- [x] `GET /export/markdown` - Markdownエクスポート
  - クエリパラメータ: `type`, `tags`
  - レスポンス: ZIPファイル
- [x] `GET /export/json` - JSONエクスポート
  - レスポンス: JSONファイル

#### 3.3.4 フロントエンド実装
- [x] `apps/web/src/routes/settings/+page.svelte` - 設定ページ
- [x] `apps/web/src/lib/components/ExportDialog.svelte` - エクスポートダイアログ（設定ページに統合）
- [x] エクスポート形式選択
- [x] エクスポート実行・ダウンロード

## 4. 技術的詳細

### 4.1 Webクリップ

#### HTML取得
- `fetch` APIを使用
- タイムアウト: 30秒
- 最大サイズ制限: 10MB
- リダイレクト対応

#### HTML to Markdown変換
- Phase1のRSS機能と同様のロジックを再利用
- 不要な要素の除去（広告、ナビゲーション等）
- メインコンテンツの抽出

### 4.2 ファイル管理

#### ファイルサイズ制限
- デフォルト: 50MB
- 設定可能（環境変数）

#### サポートMIMEタイプ
- PDF: `application/pdf`
- 画像: `image/*`
- テキスト: `text/*`
- その他: 任意（将来拡張）

#### ファイル保存
- 開発環境: ローカルファイルシステム
- 本番環境: ローカルファイルシステム（将来はオブジェクトストレージ対応）

### 4.3 エクスポート

#### Markdownエクスポート形式
```markdown
---
id: note-id
title: Note Title
tags: [tag1, tag2]
created_at: 1234567890
updated_at: 1234567890
links:
  - to: note-id-2
  - from: note-id-3
---

Note content here...
```

#### JSONエクスポート形式
```json
{
  "version": "1.0",
  "exported_at": 1234567890,
  "notes": [...],
  "tags": [...],
  "links": [...],
  "rss_feeds": [...],
  "rss_items": [...],
  "web_clips": [...],
  "files": [...]
}
```

## 5. テスト計画

### 5.1 Webクリップ
- [x] HTML取得処理のテスト
- [x] HTML to Markdown変換のテスト
- [x] エラーハンドリングのテスト（タイムアウト、無効なURL等）
- [x] データアクセス層のテスト (`apps/api/src/db/web-clips.test.ts`)
- [x] サービス層のテスト (`apps/api/src/services/web-clip-fetcher.test.ts`)
- [x] APIルートのテスト (`apps/api/src/routes/web-clips.test.ts`)

### 5.2 ファイル管理
- [x] ファイルアップロード処理のテスト
- [x] ファイルダウンロード処理のテスト
- [x] ファイル削除処理のテスト
- [x] ノートとの関連付けのテスト
- [x] データアクセス層のテスト (`apps/api/src/db/files.test.ts`)
- [x] サービス層のテスト (`apps/api/src/services/file-uploader.test.ts`)
- [x] APIルートのテスト (`apps/api/src/routes/files.test.ts`)

### 5.3 エクスポート
- [x] Markdownエクスポートのテスト
- [x] JSONエクスポートのテスト
- [x] エクスポートデータの整合性確認
- [x] サービス層のテスト (`apps/api/src/services/export/markdown.test.ts`, `apps/api/src/services/export/json.test.ts`)
- [x] APIルートのテスト (`apps/api/src/routes/export.test.ts`)

## 6. 依存関係

### バックエンド
- [x] `jszip` - ZIPファイル生成（実装済み）
- [x] `cheerio` - HTMLパース（Webクリップ用、実装済み）
- Honoの標準機能でファイルアップロード処理（multipart/form-data対応、実装済み）

### フロントエンド
- 追加の依存関係なし（既存のライブラリで対応可能）

## 7. 注意事項

- Phase1の既存機能への影響を最小限に抑える
- データベーススキーマの拡張は後方互換性を保つ
- ファイルストレージは将来の拡張（オブジェクトストレージ）を考慮した設計
- エクスポート形式は他PKMツールとの互換性を考慮
- ファイルサイズ制限は環境変数で設定可能にする
- Webクリップの取得は非同期処理として実装（将来はバックグラウンドジョブ化）

## 8. 実装チェックリスト

### Webクリップ
- [x] データベーススキーマ
- [x] データアクセス層
- [x] Webクリップ取得サービス
- [x] API実装
- [x] フロントエンド実装
- [x] 型定義

### PDF/File管理
- [x] データベーススキーマ
- [x] ファイルストレージ設計
- [x] データアクセス層
- [x] ファイルアップロード処理
- [x] API実装
- [x] フロントエンド実装
- [x] 型定義

### エクスポート
- [x] Markdownエクスポート実装
- [x] JSONエクスポート実装
- [x] API実装
- [x] フロントエンド実装








