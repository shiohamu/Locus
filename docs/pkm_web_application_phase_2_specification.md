# 個人向け PKM Web アプリケーション Phase2 以降 仕様書

## 1. 目的
Phase1 で構築した個人向け PKM Web アプリケーションを基盤として、知識管理・活用・公開の幅を段階的に拡張する。

---

## 2. 前提
- 単一ユーザー前提は維持
- ローカルファースト設計を継続
- Phase1 の技術構成（Svelte / Bun / Hono / TypeScript / Turso）を踏襲

---

## 3. Phase2 対象機能

### 3.1 Web クリップ
- URL 手動登録
- HTML 取得および Markdown 変換
- 元ページ URL の保持
- ノートとして編集・タグ・リンク対応

**テーブル追加**

**web_clips**
- note_id (TEXT, PK, FK → notes_core.id)
- source_url (TEXT)
- fetched_at (INTEGER)
- content (TEXT)

---

### 3.2 PDF / File 管理
- PDF / 任意ファイルのアップロード
- ファイルメタデータ管理
- ノートとの関連付け

**テーブル追加**

**files**
- id (TEXT, PK)
- filename (TEXT)
- mime_type (TEXT)
- size (INTEGER)
- created_at (INTEGER)

**file_notes**
- file_id (TEXT, FK → files.id)
- note_id (TEXT, FK → notes_core.id)
- PK(file_id, note_id)

---

### 3.3 エクスポート機能
- Markdown 一括エクスポート
- JSON 形式での全データエクスポート
- 他 PKM ツールへの移行を想定

---

## 4. Phase3 対象機能

### 4.1 LLM 機能
- ノート要約
- RSS 記事要約
- 要点抽出

**前提**
- オンライン時のみ有効
- 外部 API またはローカル LLM 両対応可能な抽象化

---

### 4.2 自動タグ付け
- LLM またはルールベースによるタグ候補生成
- ユーザー承認後に反映

---

### 4.3 知識グラフ拡張
- 双方向リンクの可視化
- タグ・リンクを用いた関係性表示

---

## 5. Phase4（将来検討）

### 5.1 公開 / Wiki 機能
- ノート単位での公開設定
- 静的 HTML 出力
- 読み取り専用公開

---

## 6. 非目標
- 複数ユーザー同時編集
- 権限管理・ロール管理
- 企業・組織利用を前提とした機能

---

## 7. フェーズ方針

- 各 Phase は独立して実装可能
- Phase1 の安定性を最優先
- 個人開発で破綻しない粒度でのみ拡張

