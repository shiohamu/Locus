# リファクタリング計画

作成日: 2025-12-28

## 1. 概要

このドキュメントは、Locusプロジェクトのリファクタリング計画をまとめたものです。コードの重複排除、保守性の向上、型安全性の強化を目的としています。

## 2. 現状分析

### 2.1 発見された問題点

#### 2.1.1 コードの重複

1. **ユーティリティ関数の重複**
   - `formatDate`関数が複数のコンポーネントで重複定義されている
     - `apps/web/src/routes/notes/[id]/+page.svelte` (176行目)
     - `apps/web/src/routes/search/+page.svelte` (37行目)
     - `apps/web/src/routes/rss/+page.svelte` (92行目)
     - `apps/web/src/routes/files/+page.svelte` (65行目)
     - `apps/web/src/routes/web-clips/+page.svelte` (87行目)
     - `apps/web/src/lib/components/SyncStatus.svelte` (73行目)
   - 既に`apps/web/src/lib/utils.ts`に実装されているが、使用されていない

2. **API_BASE_URLの重複定義**
   - `apps/web/src/lib/api.ts`で定義されているが、以下の箇所で再定義されている：
     - `uploadFile`関数内 (300行目)
     - `getFileDownloadUrl`関数内 (345行目)
     - `getMarkdownExportUrl`関数内 (393行目)
     - `getJSONExportUrl`関数内 (406行目)

3. **スタイルの重複**
   - ボタンスタイルが各コンポーネントで重複定義されている
   - Markdownプレビューのスタイルが重複している：
     - `apps/web/src/lib/components/NoteEditor.svelte` (144-241行目)
     - `apps/web/src/routes/notes/[id]/+page.svelte` (410-507行目)
   - エラー表示のスタイルが複数箇所で定義されている

#### 2.1.2 コンポーネント構造の問題

1. **大きなコンポーネント**
   - `apps/web/src/routes/notes/[id]/+page.svelte`が606行と非常に長い
   - ロジックとUIが混在している
   - 複数の責務を持っている（表示、編集、削除、要約など）

2. **APIクライアントの肥大化**
   - `apps/web/src/lib/api.ts`が521行と長い
   - 機能ごとに分割すべき

#### 2.1.3 型安全性の問題

1. **`unknown`型の使用**
   - `api.ts`の複数の関数で`unknown`型が使用されている
   - 型安全性が損なわれている

## 3. リファクタリング計画

### 3.1 Phase 1: ユーティリティ関数の統合

**目的**: 重複しているユーティリティ関数を統合し、共通モジュールから使用するようにする

**タスク**:
1. `formatDate`関数の重複を削除
   - すべてのコンポーネントで`apps/web/src/lib/utils.ts`の`formatDate`をインポートして使用
   - 重複定義を削除

2. `API_BASE_URL`の重複を削除
   - `apps/web/src/lib/api.ts`に`getApiBaseUrl()`関数を作成
   - すべての箇所でこの関数を使用

**影響範囲**:
- `apps/web/src/routes/notes/[id]/+page.svelte`
- `apps/web/src/routes/search/+page.svelte`
- `apps/web/src/routes/rss/+page.svelte`
- `apps/web/src/routes/files/+page.svelte`
- `apps/web/src/routes/web-clips/+page.svelte`
- `apps/web/src/lib/components/SyncStatus.svelte`
- `apps/web/src/lib/api.ts`

**推定工数**: 2-3時間

### 3.2 Phase 2: 共通スタイルの抽出

**目的**: 重複しているスタイルを共通CSSモジュールに抽出する

**タスク**:
1. 共通スタイルファイルの作成
   - `apps/web/src/lib/styles/`ディレクトリを作成
   - `buttons.css` - ボタンスタイル
   - `markdown.css` - Markdownプレビュースタイル
   - `errors.css` - エラー表示スタイル
   - `forms.css` - フォームスタイル

2. 各コンポーネントで共通スタイルをインポート
   - 重複しているスタイルを削除
   - 共通スタイルをインポート

**影響範囲**:
- `apps/web/src/lib/components/NoteEditor.svelte`
- `apps/web/src/routes/notes/[id]/+page.svelte`
- `apps/web/src/routes/notes/new/+page.svelte`
- `apps/web/src/routes/search/+page.svelte`
- その他のコンポーネント

**推定工数**: 4-5時間

### 3.3 Phase 3: APIクライアントの分割

**目的**: 大きなAPIクライアントファイルを機能ごとに分割する

**タスク**:
1. APIクライアントの分割
   - `apps/web/src/lib/api/`ディレクトリを作成
   - `base.ts` - 共通処理（`apiRequest`、`getApiBaseUrl`など）
   - `notes.ts` - ノート関連API
   - `tags.ts` - タグ関連API
   - `rss.ts` - RSS関連API
   - `files.ts` - ファイル関連API
   - `search.ts` - 検索関連API
   - `llm.ts` - LLM関連API
   - `sync.ts` - 同期関連API
   - `export.ts` - エクスポート関連API
   - `graph.ts` - グラフ関連API
   - `web-clips.ts` - Webクリップ関連API
   - `index.ts` - すべてのAPIを再エクスポート

2. 型定義の改善
   - `unknown`型を適切な型に置き換える
   - リクエスト/レスポンス型を明確に定義

**影響範囲**:
- `apps/web/src/lib/api.ts` (削除)
- すべてのコンポーネント（インポートパスの変更）

**推定工数**: 6-8時間

### 3.4 Phase 4: コンポーネントの分割とリファクタリング

**目的**: 大きなコンポーネントを小さなコンポーネントに分割し、責務を明確にする

**タスク**:
1. `notes/[id]/+page.svelte`の分割
   - `NoteView.svelte` - ノート表示コンポーネント
   - `NoteEdit.svelte` - ノート編集コンポーネント
   - `NoteHeader.svelte` - ノートヘッダーコンポーネント
   - `NoteActions.svelte` - ノートアクション（編集、削除、要約）コンポーネント
   - `NoteSummary.svelte` - 要約表示コンポーネント
   - `NoteMeta.svelte` - メタ情報表示コンポーネント（RSS、Webクリップ用）

2. カスタムフックの作成
   - `useNote.ts` - ノートの読み込み、保存、削除ロジック
   - `useAutoSave.ts` - 自動保存ロジック
   - `useNoteSummary.ts` - 要約生成ロジック

**影響範囲**:
- `apps/web/src/routes/notes/[id]/+page.svelte`
- 新規コンポーネントファイル

**推定工数**: 8-10時間

### 3.5 Phase 5: エラーハンドリングの統一

**目的**: エラーハンドリングのパターンを統一し、再利用可能にする

**タスク**:
1. エラーハンドリングユーティリティの作成
   - `apps/web/src/lib/utils/error-handling.ts`を作成
   - `handleApiError`関数を作成
   - エラーメッセージの統一フォーマット

2. エラー表示コンポーネントの作成
   - `ErrorDisplay.svelte`コンポーネントを作成
   - すべてのコンポーネントで使用

**影響範囲**:
- すべてのコンポーネント

**推定工数**: 3-4時間

### 3.6 Phase 6: 型定義の改善

**目的**: 型安全性を向上させる

**タスク**:
1. API型定義の追加
   - `apps/web/src/lib/types/api.ts`を作成
   - リクエスト/レスポンス型を定義

2. コンポーネントプロップ型の明確化
   - すべてのコンポーネントで適切な型を定義

**影響範囲**:
- すべてのファイル

**推定工数**: 4-5時間

## 4. 実装順序

推奨される実装順序：

1. **Phase 1** - ユーティリティ関数の統合（影響範囲が小さい、リスクが低い）
2. **Phase 2** - 共通スタイルの抽出（Phase 1の後に実施しやすい）
3. **Phase 3** - APIクライアントの分割（他のPhaseに影響するため早期に実施）
4. **Phase 5** - エラーハンドリングの統一（Phase 3の後に実施）
5. **Phase 4** - コンポーネントの分割（Phase 3とPhase 5の後に実施）
6. **Phase 6** - 型定義の改善（全体的な改善のため最後に実施）

## 5. テスト戦略

各Phaseの完了後、以下を実施：

1. **ユニットテスト**
   - 変更された関数のテストを実行
   - 既存のテストが通ることを確認

2. **統合テスト**
   - 主要な機能が正常に動作することを確認
   - E2Eテストを実行

3. **手動テスト**
   - 主要なユーザーフローをテスト
   - UIの見た目が変わっていないことを確認

## 6. リスク管理

### 6.1 潜在的なリスク

1. **破壊的変更**
   - APIクライアントの分割により、インポートパスが変更される
   - **対策**: 段階的に移行し、後方互換性を保つ

2. **スタイルの崩れ**
   - 共通スタイルの抽出により、一部のスタイルが適用されない可能性
   - **対策**: 各Phase後にビジュアルリグレッションテストを実施

3. **型エラー**
   - 型定義の改善により、既存のコードで型エラーが発生する可能性
   - **対策**: 段階的に型を厳密化し、エラーを修正

### 6.2 ロールバック計画

各Phaseは独立して実装できるため、問題が発生した場合は該当Phaseのみをロールバック可能。

## 7. 成功基準

リファクタリングが成功したと判断する基準：

1. **コードの重複が削減された**
   - `formatDate`関数の重複が0件
   - `API_BASE_URL`の重複が0件
   - 共通スタイルの重複が80%以上削減

2. **コンポーネントサイズの削減**
   - `notes/[id]/+page.svelte`が300行以下になる
   - 各コンポーネントが単一の責務を持つ

3. **型安全性の向上**
   - `unknown`型の使用が0件（または最小限）
   - すべてのAPI関数に適切な型が定義されている

4. **テストの通過**
   - すべての既存テストが通過
   - 新規テストが追加されている

5. **パフォーマンスの維持**
   - リファクタリング前後でパフォーマンスが劣化していない

## 8. 次のステップ

この計画に同意いただけた場合、Phase 1から順次実装を開始します。

各Phaseの実装前に、詳細な実装計画を提示し、承認を得てから実装を進めます。

