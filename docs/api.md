# API ドキュメント

自動生成日時: 2025-12-24 05:52:52

---

## apps/api/src/db/db.ts

### getDb

**型**: `function`

**シグネチャ**:
```
function getDb()
```

**説明**:

データベースクライアントを取得する
環境変数に基づいてTursoまたはローカルSQLiteに接続する

*定義場所: apps/api/src/db/db.ts:3*

---


## apps/api/src/db/links.ts

### createLink

**型**: `function`

**シグネチャ**:
```
function createLink(...)
```

**説明**:

リンクを作成する

*定義場所: apps/api/src/db/links.ts:4*

---

### getLinksByNote

**型**: `function`

**シグネチャ**:
```
function getLinksByNote(...)
```

**説明**:

ノートのリンクを取得する（双方向）

*定義場所: apps/api/src/db/links.ts:16*

---

### deleteLink

**型**: `function`

**シグネチャ**:
```
function deleteLink(...)
```

**説明**:

リンクを削除する

*定義場所: apps/api/src/db/links.ts:53*

---


## apps/api/src/db/notes.ts

### createNote

**型**: `function`

**シグネチャ**:
```
function createNote(...)
```

**説明**:

ノートを作成する

*定義場所: apps/api/src/db/notes.ts:4*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノートを取得する

*定義場所: apps/api/src/db/notes.ts:24*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes.ts:36*

---

### updateNote

**型**: `function`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノートを更新する

*定義場所: apps/api/src/db/notes.ts:51*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノートを削除する（論理削除）

*定義場所: apps/api/src/db/notes.ts:71*

---

### listNotes

**型**: `function`

**シグネチャ**:
```
function listNotes(...)
```

**説明**:

ノート一覧を取得する

*定義場所: apps/api/src/db/notes.ts:82*

---


## apps/api/src/db/notes_md.ts

### createNoteMD

**型**: `function`

**シグネチャ**:
```
function createNoteMD(...)
```

**説明**:

Markdownノートを作成する

*定義場所: apps/api/src/db/notes_md.ts:4*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノートを取得する

*定義場所: apps/api/src/db/notes_md.ts:16*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes_md.ts:26*

---

### updateNoteMD

**型**: `function`

**シグネチャ**:
```
function updateNoteMD(...)
```

**説明**:

Markdownノートを更新する

*定義場所: apps/api/src/db/notes_md.ts:37*

---


## apps/api/src/db/rss.ts

### createFeed

**型**: `function`

**シグネチャ**:
```
function createFeed(...)
```

**説明**:

RSSフィードを作成する

*定義場所: apps/api/src/db/rss.ts:4*

---

### getFeed

**型**: `function`

**シグネチャ**:
```
function getFeed(...)
```

**説明**:

RSSフィードを取得する

*定義場所: apps/api/src/db/rss.ts:17*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/rss.ts:27*

---

### updateFeed

**型**: `function`

**シグネチャ**:
```
function updateFeed(...)
```

**説明**:

RSSフィードを更新する

*定義場所: apps/api/src/db/rss.ts:40*

---

### listFeeds

**型**: `function`

**シグネチャ**:
```
function listFeeds()
```

**説明**:

RSSフィード一覧を取得する

*定義場所: apps/api/src/db/rss.ts:52*

---

### createItem

**型**: `function`

**シグネチャ**:
```
function createItem(...)
```

**説明**:

RSSアイテムを作成する

*定義場所: apps/api/src/db/rss.ts:69*

---

### deleteFeed

**型**: `function`

**シグネチャ**:
```
function deleteFeed(...)
```

**説明**:

RSSフィードを削除する

*定義場所: apps/api/src/db/rss.ts:88*

---

### getItemByNoteId

**型**: `function`

**シグネチャ**:
```
function getItemByNoteId(...)
```

**説明**:

ノートIDに基づいてRSSアイテムを取得する

*定義場所: apps/api/src/db/rss.ts:99*

---

### getItemsByFeed

**型**: `function`

**シグネチャ**:
```
function getItemsByFeed(...)
```

**説明**:

フィードIDに基づいてRSSアイテム一覧を取得する

*定義場所: apps/api/src/db/rss.ts:125*

---


## apps/api/src/db/search.ts

### searchNotes

**型**: `function`

**シグネチャ**:
```
function searchNotes(...)
```

**説明**:

全文検索を実行する
FTS5テーブルではnote_idはUNINDEXEDカラムとして保持されている

*定義場所: apps/api/src/db/search.ts:4*

---

### updateFTS

**型**: `function`

**シグネチャ**:
```
function updateFTS(...)
```

**説明**:

FTSインデックスを更新する
FTS5テーブルではUPSERTが使えないため、DELETEしてからINSERTする
note_idはUNINDEXEDカラムなので、WHERE句で使用可能

*定義場所: apps/api/src/db/search.ts:35*

---


## apps/api/src/db/tags.ts

### createTag

**型**: `function`

**シグネチャ**:
```
function createTag(tag: Tag)
```

**説明**:

タグを作成する

*定義場所: apps/api/src/db/tags.ts:4*

---

### getTag

**型**: `function`

**シグネチャ**:
```
function getTag(...)
```

**説明**:

タグを取得する

*定義場所: apps/api/src/db/tags.ts:16*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/tags.ts:26*

---

### getTagByName

**型**: `function`

**シグネチャ**:
```
function getTagByName(...)
```

**説明**:

タグ名でタグを取得する

*定義場所: apps/api/src/db/tags.ts:37*

---

### listTags

**型**: `function`

**シグネチャ**:
```
function listTags()
```

**説明**:

タグ一覧を取得する

*定義場所: apps/api/src/db/tags.ts:58*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグを追加する

*定義場所: apps/api/src/db/tags.ts:73*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグを削除する

*定義場所: apps/api/src/db/tags.ts:84*

---

### getTagsByNote

**型**: `function`

**シグネチャ**:
```
function getTagsByNote(...)
```

**説明**:

ノートに紐づくタグ一覧を取得する

*定義場所: apps/api/src/db/tags.ts:98*

---

### deleteTag

**型**: `function`

**シグネチャ**:
```
function deleteTag(...)
```

**説明**:

タグを削除する
関連するnote_tagsも削除される（外部キー制約による）

*定義場所: apps/api/src/db/tags.ts:118*

---


## apps/api/src/index.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:37*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:58*

---


## apps/api/src/middleware/cors.ts

### corsMiddleware

**型**: `function`

**シグネチャ**:
```
function corsMiddleware(...)
```

**説明**:

CORSミドルウェア

*定義場所: apps/api/src/middleware/cors.ts:4*

---


## apps/api/src/middleware/error-handler.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/middleware/error-handler.ts:8*

---


## apps/api/src/middleware/logger.ts

### logger

**型**: `function`

**シグネチャ**:
```
function logger(...)
```

**説明**:

リクエストログミドルウェア

*定義場所: apps/api/src/middleware/logger.ts:3*

---


## apps/api/src/routes/notes.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes.ts:42*

---


## apps/api/src/routes/notes_md.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes_md.ts:19*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes_md.ts:47*

---


## apps/api/src/routes/rss.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.ts:54*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.ts:79*

---


## apps/api/src/routes/search.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/search.ts:12*

---


## apps/api/src/routes/sync.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/sync.ts:19*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/sync.ts:81*

---


## apps/api/src/server.ts

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/server.ts:13*

---


## apps/api/src/services/rss-fetcher.ts

### fetchRSSFeed

**型**: `function`

**シグネチャ**:
```
function fetchRSSFeed(...)
```

**説明**:

RSSフィードを取得し、ノートとして保存する

*定義場所: apps/api/src/services/rss-fetcher.ts:11*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:31*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:32*

---


## apps/api/src/utils/link-detector.ts

### detectNoteLinks

**型**: `function`

**シグネチャ**:
```
function detectNoteLinks(...)
```

**説明**:

Markdown内のリンクを検出するユーティリティ
/

/**
MarkdownコンテンツからノートIDへのリンクを検出する

検出する形式:
- `[[note-id]]` - ウィキスタイルリンク
- `[text](note-id)` - Markdownリンク（note-idがUUID形式の場合）
- `[text](/notes/note-id)` - Markdownリンク（相対パス形式）

@param content - Markdownコンテンツ
@returns 検出されたノートIDの配列（重複なし）

*定義場所: apps/api/src/utils/link-detector.ts:1*

---


## apps/web/src/lib/api.ts

### apiRequest

**型**: `function`

**シグネチャ**:
```
function apiRequest(...)
```

**説明**:

APIクライアント関数
/

// 開発環境ではViteのプロキシ経由（/api）、本番環境では環境変数から取得
const API_BASE_URL =
import.meta.env.VITE_API_URL ||
(import.meta.env.DEV ? "/api" : "http://localhost:3000");

/**
APIリクエストの共通処理

*定義場所: apps/web/src/lib/api.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api.ts:26*

---

### getNotes

**型**: `function`

**シグネチャ**:
```
function getNotes(...)
```

**説明**:

ノート一覧取得

*定義場所: apps/web/src/lib/api.ts:36*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノート取得

*定義場所: apps/web/src/lib/api.ts:53*

---

### createNote

**型**: `function`

**シグネチャ**:
```
function createNote(...)
```

**説明**:

ノート作成

*定義場所: apps/web/src/lib/api.ts:60*

---

### updateNote

**型**: `function`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノート更新

*定義場所: apps/web/src/lib/api.ts:70*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノート削除

*定義場所: apps/web/src/lib/api.ts:80*

---

### createNoteMD

**型**: `function`

**シグネチャ**:
```
function createNoteMD(...)
```

**説明**:

Markdownノート作成

*定義場所: apps/web/src/lib/api.ts:89*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノート取得

*定義場所: apps/web/src/lib/api.ts:99*

---

### updateNoteMD

**型**: `function`

**シグネチャ**:
```
function updateNoteMD(...)
```

**説明**:

Markdownノート更新

*定義場所: apps/web/src/lib/api.ts:106*

---

### getTags

**型**: `function`

**シグネチャ**:
```
function getTags()
```

**説明**:

タグ一覧取得

*定義場所: apps/web/src/lib/api.ts:116*

---

### createTag

**型**: `function`

**シグネチャ**:
```
function createTag(...)
```

**説明**:

タグ作成

*定義場所: apps/web/src/lib/api.ts:123*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグ追加

*定義場所: apps/web/src/lib/api.ts:133*

---

### getTagsByNote

**型**: `function`

**シグネチャ**:
```
function getTagsByNote(...)
```

**説明**:

ノートに紐づくタグ一覧取得

*定義場所: apps/web/src/lib/api.ts:143*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグ削除

*定義場所: apps/web/src/lib/api.ts:150*

---

### deleteTag

**型**: `function`

**シグネチャ**:
```
function deleteTag(...)
```

**説明**:

タグ削除

*定義場所: apps/web/src/lib/api.ts:159*

---

### getNoteLinks

**型**: `function`

**シグネチャ**:
```
function getNoteLinks(...)
```

**説明**:

ノートのリンク取得

*定義場所: apps/web/src/lib/api.ts:168*

---

### searchNotes

**型**: `function`

**シグネチャ**:
```
function searchNotes(...)
```

**説明**:

全文検索

*定義場所: apps/web/src/lib/api.ts:175*

---

### getRSSFeeds

**型**: `function`

**シグネチャ**:
```
function getRSSFeeds()
```

**説明**:

RSSフィード一覧取得

*定義場所: apps/web/src/lib/api.ts:189*

---

### createRSSFeed

**型**: `function`

**シグネチャ**:
```
function createRSSFeed(...)
```

**説明**:

RSSフィード登録

*定義場所: apps/web/src/lib/api.ts:196*

---

### deleteRSSFeed

**型**: `function`

**シグネチャ**:
```
function deleteRSSFeed(...)
```

**説明**:

RSSフィード削除

*定義場所: apps/web/src/lib/api.ts:206*

---

### fetchRSSFeed

**型**: `function`

**シグネチャ**:
```
function fetchRSSFeed(...)
```

**説明**:

RSSフィード取得・更新

*定義場所: apps/web/src/lib/api.ts:215*

---

### getRSSItem

**型**: `function`

**シグネチャ**:
```
function getRSSItem(...)
```

**説明**:

RSSアイテム取得（ノートIDで取得）

*定義場所: apps/web/src/lib/api.ts:225*

---

### syncPull

**型**: `function`

**シグネチャ**:
```
function syncPull(...)
```

**説明**:

同期プル

*定義場所: apps/web/src/lib/api.ts:232*

---

### syncPush

**型**: `function`

**シグネチャ**:
```
function syncPush(...)
```

**説明**:

同期プッシュ

*定義場所: apps/web/src/lib/api.ts:239*

---


## apps/web/src/lib/storage.ts

### getDB

**型**: `function`

**シグネチャ**:
```
function getDB()
```

**説明**:

IndexedDBを開く

*定義場所: apps/web/src/lib/storage.ts:44*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/storage.ts:48*

---

### upgrade

**型**: `function`

**シグネチャ**:
```
function upgrade(...)
```

*説明なし*

*定義場所: apps/web/src/lib/storage.ts:53*

---

### saveNote

**型**: `function`

**シグネチャ**:
```
function saveNote(...)
```

**説明**:

ノートを保存

*定義場所: apps/web/src/lib/storage.ts:92*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノートを取得

*定義場所: apps/web/src/lib/storage.ts:100*

---

### getAllNotes

**型**: `function`

**シグネチャ**:
```
function getAllNotes()
```

**説明**:

すべてのノートを取得

*定義場所: apps/web/src/lib/storage.ts:108*

---

### saveNoteMD

**型**: `function`

**シグネチャ**:
```
function saveNoteMD(...)
```

**説明**:

Markdownノートを保存

*定義場所: apps/web/src/lib/storage.ts:116*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノートを取得

*定義場所: apps/web/src/lib/storage.ts:124*

---

### saveRSSItem

**型**: `function`

**シグネチャ**:
```
function saveRSSItem(...)
```

**説明**:

RSSアイテムを保存

*定義場所: apps/web/src/lib/storage.ts:132*

---

### getRSSItem

**型**: `function`

**シグネチャ**:
```
function getRSSItem(...)
```

**説明**:

RSSアイテムを取得

*定義場所: apps/web/src/lib/storage.ts:140*

---

### saveTag

**型**: `function`

**シグネチャ**:
```
function saveTag(tag: Tag)
```

**説明**:

タグを保存

*定義場所: apps/web/src/lib/storage.ts:148*

---

### getAllTags

**型**: `function`

**シグネチャ**:
```
function getAllTags()
```

**説明**:

すべてのタグを取得

*定義場所: apps/web/src/lib/storage.ts:156*

---

### saveLink

**型**: `function`

**シグネチャ**:
```
function saveLink(...)
```

**説明**:

リンクを保存

*定義場所: apps/web/src/lib/storage.ts:164*

---

### getAllLinks

**型**: `function`

**シグネチャ**:
```
function getAllLinks()
```

**説明**:

すべてのリンクを取得

*定義場所: apps/web/src/lib/storage.ts:172*

---

### saveFeed

**型**: `function`

**シグネチャ**:
```
function saveFeed(...)
```

**説明**:

フィードを保存

*定義場所: apps/web/src/lib/storage.ts:180*

---

### getAllFeeds

**型**: `function`

**シグネチャ**:
```
function getAllFeeds()
```

**説明**:

すべてのフィードを取得

*定義場所: apps/web/src/lib/storage.ts:188*

---

### saveLastSync

**型**: `function`

**シグネチャ**:
```
function saveLastSync(...)
```

**説明**:

最終同期時刻を保存

*定義場所: apps/web/src/lib/storage.ts:196*

---

### getLastSync

**型**: `function`

**シグネチャ**:
```
function getLastSync()
```

**説明**:

最終同期時刻を取得

*定義場所: apps/web/src/lib/storage.ts:204*

---

### clearAll

**型**: `function`

**シグネチャ**:
```
function clearAll()
```

**説明**:

すべてのデータをクリア（デバッグ用）

*定義場所: apps/web/src/lib/storage.ts:213*

---


## apps/web/src/lib/sync.ts

### pullSync

**型**: `function`

**シグネチャ**:
```
function pullSync()
```

**説明**:

サーバーから差分を取得してローカルストレージに保存

*定義場所: apps/web/src/lib/sync.ts:5*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/web/src/lib/sync.ts:25*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/sync.ts:27*

---

### pushSync

**型**: `function`

**シグネチャ**:
```
function pushSync()
```

**説明**:

ローカルストレージから差分を取得してサーバーに送信

*定義場所: apps/web/src/lib/sync.ts:73*

---

### sync

**型**: `function`

**シグネチャ**:
```
function sync()
```

**説明**:

双方向同期（pull → push）

*定義場所: apps/web/src/lib/sync.ts:126*

---


## apps/web/src/lib/utils.ts

### timestampToDate

**型**: `function`

**シグネチャ**:
```
function timestampToDate(...)
```

**説明**:

ユーティリティ関数
/

/**
Unix timestamp（秒）をDateオブジェクトに変換

*定義場所: apps/web/src/lib/utils.ts:1*

---

### dateToTimestamp

**型**: `function`

**シグネチャ**:
```
function dateToTimestamp(...)
```

**説明**:

DateオブジェクトをUnix timestamp（秒）に変換

*定義場所: apps/web/src/lib/utils.ts:12*

---

### nowTimestamp

**型**: `function`

**シグネチャ**:
```
function nowTimestamp()
```

**説明**:

現在のUnix timestamp（秒）を取得

*定義場所: apps/web/src/lib/utils.ts:19*

---

### generateId

**型**: `function`

**シグネチャ**:
```
function generateId()
```

**説明**:

UUID v4を生成

*定義場所: apps/web/src/lib/utils.ts:26*

---

### formatDate

**型**: `function`

**シグネチャ**:
```
function formatDate(...)
```

**説明**:

日時をフォーマット

*定義場所: apps/web/src/lib/utils.ts:33*

---


## apps/web/static/sw.js

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/static/sw.js:25*

---


## apps/web/vite.config.ts

### rewrite

**型**: `function`

**シグネチャ**:
```
function rewrite(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:12*

---


## scripts/migrate.ts

### migrate

**型**: `function`

**シグネチャ**:
```
function migrate()
```

**説明**:

データベースマイグレーションを実行する

*定義場所: scripts/migrate.ts:5*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:43*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:53*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:57*

---
