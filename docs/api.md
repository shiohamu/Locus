# API ドキュメント

作成日: 2025-12-30
最終更新: 2025-12-30

このドキュメントは、Locus APIのエンドポイント一覧と使用方法を説明します。

## ベースURL

すべてのAPIエンドポイントは `/api` プレフィックスで始まります。

## 認証

現在、認証は実装されていません。将来的に認証機能を追加する予定です。

## エラーレスポンス

エラーが発生した場合、以下の形式でレスポンスが返されます：

```json
{
  "error": "エラーメッセージ"
}
```

HTTPステータスコード：
- `400`: バリデーションエラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

## エンドポイント一覧

### ノート関連

#### GET /api/notes
ノート一覧を取得します。

**クエリパラメータ:**
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `tags` (optional): タグ名の配列（カンマ区切り）
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
```json
[
  {
    "id": "string",
    "type": "md" | "rss" | "web_clip",
    "title": "string",
    "created_at": 1234567890,
    "updated_at": 1234567890,
    "deleted_at": null | 1234567890,
    "public": 0 | 1
  }
]
```

#### GET /api/notes/with-tags
ノート一覧とタグ情報を一度に取得します（最適化版）。

**クエリパラメータ:**
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `tags` (optional): タグ名の配列（カンマ区切り）
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
```json
{
  "notes": [...],
  "tagsMap": {
    "note-id": ["tag1", "tag2"]
  }
}
```

#### POST /api/notes
ノートを作成します。

**リクエストボディ:**
```json
{
  "id": "string",
  "type": "md" | "rss" | "web_clip",
  "title": "string",
  "created_at": 1234567890,
  "updated_at": 1234567890,
  "deleted_at": null,
  "public": 0 | 1
}
```

**レスポンス:**
作成されたノート情報（201 Created）

#### GET /api/notes/:id
ノートを取得します。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
ノート情報

#### PUT /api/notes/:id
ノートを更新します。

**パスパラメータ:**
- `id`: ノートID

**リクエストボディ:**
```json
{
  "title": "string",
  "public": 0 | 1
}
```

**レスポンス:**
更新されたノート情報

#### DELETE /api/notes/:id
ノートを削除します（論理削除）。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "message": "Note deleted"
}
```

#### DELETE /api/notes/batch
ノートを一括削除します（論理削除）。

**リクエストボディ:**
```json
{
  "note_ids": ["id1", "id2", ...]
}
```

**レスポンス:**
```json
{
  "message": "N notes deleted",
  "deleted_count": N
}
```

### Markdownノート関連

#### GET /api/notes/md/:id
Markdownノートを取得します。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "note_id": "string",
  "content": "string"
}
```

#### POST /api/notes/md
Markdownノートを作成します。

**リクエストボディ:**
```json
{
  "core": {
    "id": "string",
    "type": "md",
    "title": "string",
    ...
  },
  "md": {
    "note_id": "string",
    "content": "string"
  }
}
```

**レスポンス:**
作成されたノート情報（201 Created）

#### PUT /api/notes/md/:id
Markdownノートを更新します。

**パスパラメータ:**
- `id`: ノートID

**リクエストボディ:**
```json
{
  "core": {
    "title": "string",
    ...
  },
  "md": {
    "content": "string"
  }
}
```

**レスポンス:**
更新されたノート情報

### ファイル関連

#### POST /api/files
ファイルをアップロードします。

**リクエスト:**
- Content-Type: `multipart/form-data`
- `file`: アップロードするファイル

**レスポンス:**
```json
{
  "id": "string",
  "filename": "string",
  "mime_type": "string",
  "size": 12345,
  "created_at": 1234567890,
  "show_in_notes": false
}
```
（201 Created）

#### GET /api/files
ファイル一覧を取得します。

**クエリパラメータ:**
- `note_id` (optional): ノートID（指定した場合、そのノートに紐づくファイルのみ取得）
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
ファイル一覧の配列

#### GET /api/files/:id
ファイルメタデータを取得します。

**パスパラメータ:**
- `id`: ファイルID

**レスポンス:**
ファイル情報

#### GET /api/files/:id/download
ファイルをダウンロードします。

**パスパラメータ:**
- `id`: ファイルID

**レスポンス:**
ファイルデータ（Content-TypeとContent-Dispositionヘッダー付き）

#### DELETE /api/files/:id
ファイルを削除します。

**パスパラメータ:**
- `id`: ファイルID

**レスポンス:**
```json
{
  "message": "File deleted"
}
```

#### PUT /api/files/:id
ファイルを更新します。

**パスパラメータ:**
- `id`: ファイルID

**リクエストボディ:**
```json
{
  "filename": "string",
  "show_in_notes": true | false
}
```

**レスポンス:**
更新されたファイル情報

#### POST /api/files/:id/notes
ノートとファイルを関連付けます。

**パスパラメータ:**
- `id`: ファイルID

**リクエストボディ:**
```json
{
  "note_id": "string"
}
```

**レスポンス:**
関連付け情報（201 Created）

#### DELETE /api/files/:id/notes/:noteId
ノートとファイルの関連を解除します。

**パスパラメータ:**
- `id`: ファイルID
- `noteId`: ノートID

**レスポンス:**
```json
{
  "message": "File unlinked from note"
}
```

### タグ関連

#### GET /api/notes/:id/tags
ノートに紐づくタグ一覧を取得します。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
タグ一覧の配列

#### POST /api/notes/:id/tags
ノートにタグを追加します。

**パスパラメータ:**
- `id`: ノートID

**リクエストボディ:**
```json
{
  "tag_id": "string"
}
```

**レスポンス:**
```json
{
  "message": "Tag added to note"
}
```
（201 Created）

#### DELETE /api/notes/:id/tags/:tag
ノートからタグを削除します。

**パスパラメータ:**
- `id`: ノートID
- `tag`: タグID

**レスポンス:**
```json
{
  "message": "Tag removed from note"
}
```

#### POST /api/notes/:id/tags/suggestions
タグ候補を生成します。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "suggestions": [
    {
      "name": "string",
      "confidence": 0.95,
      "method": "llm" | "rule-based"
    }
  ]
}
```

### Webクリップ関連

#### POST /api/web-clips
Webクリップを作成します。

**リクエストボディ:**
```json
{
  "url": "string"
}
```

**レスポンス:**
```json
{
  "note": {...},
  "webClip": {...}
}
```
（201 Created）

#### GET /api/web-clips
Webクリップ一覧を取得します。

**クエリパラメータ:**
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
Webクリップ一覧（ノート情報付き）の配列

#### GET /api/web-clips/:id
Webクリップを取得します。

**パスパラメータ:**
- `id`: WebクリップID（ノートIDと同じ）

**レスポンス:**
Webクリップ情報（ノート情報付き）

#### PUT /api/web-clips/:id
Webクリップを更新（再取得）します。

**パスパラメータ:**
- `id`: WebクリップID（ノートIDと同じ）

**レスポンス:**
更新されたノートとWebクリップ情報

#### DELETE /api/web-clips/:id
Webクリップを削除します。

**パスパラメータ:**
- `id`: WebクリップID（ノートIDと同じ）

**レスポンス:**
```json
{
  "message": "Web clip deleted"
}
```

### RSS関連

#### POST /api/rss/feeds
RSSフィードを登録します。

**リクエストボディ:**
```json
{
  "id": "string" (optional),
  "url": "string",
  "title": "string"
}
```

**レスポンス:**
作成されたRSSフィード（201 Created）

#### GET /api/rss/feeds
RSSフィード一覧を取得します。

**レスポンス:**
RSSフィード一覧の配列

#### DELETE /api/rss/feeds/:id
RSSフィードを削除します。

**パスパラメータ:**
- `id`: RSSフィードID

**レスポンス:**
```json
{
  "message": "Feed deleted"
}
```

#### GET /api/rss/items/:noteId
RSSアイテムを取得します（ノートIDで取得）。

**パスパラメータ:**
- `noteId`: ノートID

**レスポンス:**
RSSアイテム情報

#### POST /api/rss/fetch
RSSフィードを取得・更新します。

**リクエストボディ:**
```json
{
  "feed_id": "string" (optional)
}
```

**レスポンス:**
- `feed_id`が指定された場合:
```json
{
  "created": 5,
  "updated": 0
}
```

- `feed_id`が指定されない場合（すべてのフィードを更新）:
```json
{
  "total": 10,
  "success": 8,
  "failed": 2
}
```

#### PUT /api/rss/items/:noteId
RSSアイテムのコンテンツを更新します。

**パスパラメータ:**
- `noteId`: ノートID

**リクエストボディ:**
```json
{
  "content": "string"
}
```

**レスポンス:**
更新されたRSSアイテム

### 検索関連

#### GET /api/search
全文検索を実行します。

**クエリパラメータ:**
- `q` (required): 検索クエリ
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
検索結果のノート一覧

### グラフ関連

#### GET /api/graph
グラフデータを取得します。

**クエリパラメータ:**
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `tags` (optional): タグ名の配列（カンマ区切り）
- `limit` (optional): 取得件数の上限（デフォルト: 100）

**レスポンス:**
```json
{
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "type": "md" | "rss" | "web_clip",
      "tags": ["tag1", "tag2"]
    }
  ],
  "edges": [
    {
      "from": "note-id-1",
      "to": "note-id-2"
    }
  ]
}
```

### リンク関連

#### GET /api/notes/:id/links
ノートのリンクを取得します（双方向）。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "outgoing": [
    {
      "from_note_id": "string",
      "to_note_id": "string"
    }
  ],
  "incoming": [
    {
      "from_note_id": "string",
      "to_note_id": "string"
    }
  ]
}
```

### エクスポート関連

#### GET /api/export/markdown
Markdownエクスポートを生成します。

**クエリパラメータ:**
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `tags` (optional): タグ名の配列（カンマ区切り）
- `dateFrom` (optional): 開始日時（Unixタイムスタンプ）
- `dateTo` (optional): 終了日時（Unixタイムスタンプ）
- `includeFiles` (optional): ファイルを含めるかどうか（デフォルト: true）

**レスポンス:**
ZIPファイル（Content-Type: application/zip）

#### GET /api/export/json
JSONエクスポートを生成します。

**クエリパラメータ:**
- `includeFiles` (optional): ファイルを含めるかどうか（デフォルト: true）
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `tags` (optional): タグ名の配列（カンマ区切り）
- `dateFrom` (optional): 開始日時（Unixタイムスタンプ）
- `dateTo` (optional): 終了日時（Unixタイムスタンプ）

**レスポンス:**
JSONファイル（Content-Type: application/json）

#### GET /api/export/static-html
静的HTMLエクスポートを生成します（公開ノート用）。

**レスポンス:**
ZIPファイル（Content-Type: application/zip、公開ノートの静的HTMLサイトを含む）

### 同期関連

#### GET /api/sync/pull
サーバーから差分を取得します。

**クエリパラメータ:**
- `since` (required): 取得開始日時（Unixタイムスタンプ）

**レスポンス:**
```json
{
  "notes": [
    {
      "core": {...},
      "md": {...} (optional),
      "rss": {...} (optional)
    }
  ],
  "tags": [...],
  "links": [...],
  "feeds": [...]
}
```

#### POST /api/sync/push
クライアントから差分を送信します。

**リクエストボディ:**
```json
{
  "notes": [
    {
      "core": {...},
      "md": {...} (optional)
    }
  ],
  "tags": [...],
  "links": [...],
  "feeds": [...]
}
```

**レスポンス:**
```json
{
  "message": "Sync completed"
}
```

**説明:**
最終更新優先（LWW: Last Write Wins）でマージされます。

### 公開API関連

#### GET /api/public/notes
公開ノート一覧を取得します。

**クエリパラメータ:**
- `type` (optional): ノートタイプ（'md' | 'rss' | 'web_clip'）
- `limit` (optional): 取得件数の上限
- `offset` (optional): 取得開始位置

**レスポンス:**
公開ノート一覧

#### GET /api/public/notes/:id
公開ノートを取得します（詳細情報付き）。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "note": {...},
  "content": "string" | null,
  "tags": [...],
  "links": {
    "outgoing": [...],
    "incoming": [...]
  },
  "metadata": {...}
}
```

### LLM関連

#### POST /api/llm/notes/:id/summarize
ノートを要約します。

**パスパラメータ:**
- `id`: ノートID

**レスポンス:**
```json
{
  "summary": "string"
}
```

**説明:**
MarkdownノートまたはWebクリップの要約を生成します（タイムアウト: 3分）。

#### POST /api/llm/rss/:id/summarize
RSS記事を要約します。

**パスパラメータ:**
- `id`: ノートID（RSSアイテムのノートID）

**レスポンス:**
```json
{
  "summary": "string"
}
```

**説明:**
RSS記事の要約を生成します（タイムアウト: 3分）。

#### POST /api/llm/extract-key-points
要点を抽出します。

**リクエストボディ:**
```json
{
  "content": "string"
}
```

**レスポンス:**
```json
{
  "keyPoints": "string"
}
```

**説明:**
コンテンツから要点を抽出します（タイムアウト: 3分）。

#### GET /api/llm/config
LLM設定を取得します。

**レスポンス:**
```json
{
  "config": {
    "provider": "openai" | "openai-compatible" | "ollama",
    "model": "string",
    "apiKey": true (boolean, 実際の値は返されない),
    "baseUrl": "string" (optional)
  },
  "available": true | false
}
```

### 設定関連

#### GET /api/settings/llm
LLM設定を取得します。

**レスポンス:**
```json
{
  "provider": "openai" | "openai-compatible" | "ollama",
  "model": "string",
  "apiKey": true (boolean, 実際の値は返されない),
  "baseUrl": "string" (optional)
}
```

#### PUT /api/settings/llm
LLM設定を保存します。

**リクエストボディ:**
```json
{
  "provider": "openai" | "openai-compatible" | "ollama",
  "model": "string",
  "apiKey": "string" (optional, OpenAIプロバイダーの場合は必須),
  "baseUrl": "string" (optional, OpenAI互換APIプロバイダーの場合は必須)
}
```

**レスポンス:**
```json
{
  "message": "設定を保存しました"
}
```

#### DELETE /api/settings/llm
LLM設定を削除します。

**レスポンス:**
```json
{
  "message": "設定を削除しました"
}
```

---

*このドキュメントは継続的に更新されます。最新の情報については、コード内のJSDocコメントを参照してください。*
