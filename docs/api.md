# API ドキュメント

自動生成日時: 2025-12-28 16:49:14

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


## apps/api/src/db/files.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/files.test.ts:27*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/db/files.test.ts:71*

---


## apps/api/src/db/files.ts

### createFile

**型**: `function`

**シグネチャ**:
```
function createFile(...)
```

**説明**:

ファイルを作成する

*定義場所: apps/api/src/db/files.ts:4*

---

### getFile

**型**: `function`

**シグネチャ**:
```
function getFile(...)
```

**説明**:

ファイルを取得する

*定義場所: apps/api/src/db/files.ts:17*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/files.ts:27*

---

### listFiles

**型**: `function`

**シグネチャ**:
```
function listFiles(...)
```

**説明**:

ファイル一覧を取得する

*定義場所: apps/api/src/db/files.ts:41*

---

### deleteFile

**型**: `function`

**シグネチャ**:
```
function deleteFile(...)
```

**説明**:

ファイルを削除する

*定義場所: apps/api/src/db/files.ts:68*

---

### linkFileToNote

**型**: `function`

**シグネチャ**:
```
function linkFileToNote(...)
```

**説明**:

ノートとファイルを関連付ける

*定義場所: apps/api/src/db/files.ts:79*

---

### unlinkFileFromNote

**型**: `function`

**シグネチャ**:
```
function unlinkFileFromNote(...)
```

**説明**:

ノートとファイルの関連を解除する

*定義場所: apps/api/src/db/files.ts:98*

---

### getFilesByNote

**型**: `function`

**シグネチャ**:
```
function getFilesByNote(...)
```

**説明**:

ノートに紐づくファイル一覧を取得する

*定義場所: apps/api/src/db/files.ts:109*

---

### getNoteIdsByFile

**型**: `function`

**シグネチャ**:
```
function getNoteIdsByFile(...)
```

**説明**:

ファイルに紐づくノートID一覧を取得する

*定義場所: apps/api/src/db/files.ts:132*

---


## apps/api/src/db/links.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/links.test.ts:22*

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


## apps/api/src/db/notes.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes.test.ts:27*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes.test.ts:143*

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

*定義場所: apps/api/src/db/notes.ts:65*

---

### listNotes

**型**: `function`

**シグネチャ**:
```
function listNotes(...)
```

**説明**:

ノート一覧を取得する

*定義場所: apps/api/src/db/notes.ts:76*

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


## apps/api/src/db/rss.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/rss.test.ts:28*

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

*定義場所: apps/api/src/db/rss.ts:82*

---

### getItemByNoteId

**型**: `function`

**シグネチャ**:
```
function getItemByNoteId(...)
```

**説明**:

ノートIDに基づいてRSSアイテムを取得する

*定義場所: apps/api/src/db/rss.ts:93*

---

### getItemsByFeed

**型**: `function`

**シグネチャ**:
```
function getItemsByFeed(...)
```

**説明**:

フィードIDに基づいてRSSアイテム一覧を取得する

*定義場所: apps/api/src/db/rss.ts:119*

---


## apps/api/src/db/search.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/search.test.ts:22*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/db/search.test.ts:90*

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


## apps/api/src/db/settings.ts

### getSetting

**型**: `function`

**シグネチャ**:
```
function getSetting(...)
```

**説明**:

設定を取得する

*定義場所: apps/api/src/db/settings.ts:4*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/settings.ts:14*

---

### setSetting

**型**: `function`

**シグネチャ**:
```
function setSetting(...)
```

**説明**:

設定を保存する

*定義場所: apps/api/src/db/settings.ts:21*

---

### getLLMConfig

**型**: `function`

**シグネチャ**:
```
function getLLMConfig()
```

**説明**:

LLM設定を取得する

*定義場所: apps/api/src/db/settings.ts:35*

---

### setLLMConfig

**型**: `function`

**シグネチャ**:
```
function setLLMConfig(...)
```

**説明**:

LLM設定を保存する

*定義場所: apps/api/src/db/settings.ts:50*

---

### deleteSetting

**型**: `function`

**シグネチャ**:
```
function deleteSetting(...)
```

**説明**:

設定を削除する

*定義場所: apps/api/src/db/settings.ts:57*

---


## apps/api/src/db/tags.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/tags.test.ts:27*

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

*定義場所: apps/api/src/db/tags.ts:95*

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

*定義場所: apps/api/src/db/tags.ts:115*

---


## apps/api/src/db/web-clips.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/web-clips.test.ts:27*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/db/web-clips.test.ts:103*

---


## apps/api/src/db/web-clips.ts

### createWebClip

**型**: `function`

**シグネチャ**:
```
function createWebClip(...)
```

**説明**:

Webクリップを作成する

*定義場所: apps/api/src/db/web-clips.ts:4*

---

### getWebClip

**型**: `function`

**シグネチャ**:
```
function getWebClip(...)
```

**説明**:

Webクリップを取得する

*定義場所: apps/api/src/db/web-clips.ts:17*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/web-clips.ts:27*

---

### updateWebClip

**型**: `function`

**シグネチャ**:
```
function updateWebClip(...)
```

**説明**:

Webクリップを更新する

*定義場所: apps/api/src/db/web-clips.ts:40*

---

### listWebClips

**型**: `function`

**シグネチャ**:
```
function listWebClips(...)
```

**説明**:

Webクリップ一覧を取得する

*定義場所: apps/api/src/db/web-clips.ts:52*

---

### deleteWebClip

**型**: `function`

**シグネチャ**:
```
function deleteWebClip(...)
```

**説明**:

Webクリップを削除する

*定義場所: apps/api/src/db/web-clips.ts:78*

---


## apps/api/src/index.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:42*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:63*

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


## apps/api/src/middleware/keep-alive.ts

### keepAliveMiddleware

**型**: `function`

**シグネチャ**:
```
function keepAliveMiddleware(...)
```

**説明**:

Keep-Aliveヘッダーを追加するミドルウェア
長時間実行されるリクエスト（LLM処理など）で接続を維持するため

*定義場所: apps/api/src/middleware/keep-alive.ts:3*

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


## apps/api/src/routes/export.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/export.test.ts:24*

---


## apps/api/src/routes/export.ts

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/export.ts:25*

---


## apps/api/src/routes/files.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/files.test.ts:37*

---


## apps/api/src/routes/files.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/files.ts:18*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/files.ts:45*

---


## apps/api/src/routes/llm.ts

### getLLMProvider

**型**: `function`

**シグネチャ**:
```
function getLLMProvider()
```

**説明**:

LLM設定を取得

*定義場所: apps/api/src/routes/llm.ts:16*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/llm.ts:21*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/llm.ts:75*

---


## apps/api/src/routes/notes.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes.test.ts:21*

---


## apps/api/src/routes/notes.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes.ts:40*

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

*定義場所: apps/api/src/routes/rss.ts:56*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.ts:81*

---


## apps/api/src/routes/search.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/search.test.ts:21*

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


## apps/api/src/routes/settings.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/settings.ts:14*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/settings.ts:25*

---


## apps/api/src/routes/sync.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/sync.test.ts:28*

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

*定義場所: apps/api/src/routes/sync.ts:79*

---


## apps/api/src/routes/tags.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.test.ts:26*

---


## apps/api/src/routes/tags.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.ts:60*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.ts:114*

---


## apps/api/src/routes/web-clips.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/web-clips.test.ts:49*

---


## apps/api/src/routes/web-clips.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/web-clips.ts:18*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/web-clips.ts:24*

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


## apps/api/src/services/export/json.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.test.ts:33*

---


## apps/api/src/services/export/json.ts

### exportJSON

**型**: `function`

**シグネチャ**:
```
function exportJSON()
```

**説明**:

JSONエクスポートを生成

*定義場所: apps/api/src/services/export/json.ts:19*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:47*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:48*

---


## apps/api/src/services/export/markdown.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/markdown.test.ts:26*

---


## apps/api/src/services/export/markdown.ts

### generateFrontmatter

**型**: `function`

**シグネチャ**:
```
function generateFrontmatter(...)
```

**説明**:

ノートのメタデータをYAML frontmatter形式で生成

*定義場所: apps/api/src/services/export/markdown.ts:8*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/markdown.ts:24*

---

### exportMarkdown

**型**: `function`

**シグネチャ**:
```
function exportMarkdown(...)
```

**説明**:

Markdownエクスポートを生成

*定義場所: apps/api/src/services/export/markdown.ts:57*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/markdown.ts:79*

---


## apps/api/src/services/file-uploader.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.test.ts:33*

---


## apps/api/src/services/file-uploader.ts

### FILES_BASE_DIR

**型**: `function`

**シグネチャ**:
```
function FILES_BASE_DIR(...)
```

**説明**:

ファイル保存先のベースディレクトリ

*定義場所: apps/api/src/services/file-uploader.ts:6*

---

### ensureFilesDirectory

**型**: `function`

**シグネチャ**:
```
function ensureFilesDirectory()
```

**説明**:

ファイル保存ディレクトリを初期化

*定義場所: apps/api/src/services/file-uploader.ts:11*

---

### getFilePath

**型**: `function`

**シグネチャ**:
```
function getFilePath(...)
```

**説明**:

ファイル保存パスを取得

*定義場所: apps/api/src/services/file-uploader.ts:20*

---

### sanitizeFilename

**型**: `function`

**シグネチャ**:
```
function sanitizeFilename(...)
```

**説明**:

ファイル名をサニタイズ

*定義場所: apps/api/src/services/file-uploader.ts:31*

---

### isValidMimeType

**型**: `function`

**シグネチャ**:
```
function isValidMimeType(...)
```

**説明**:

MIMEタイプを検証

*定義場所: apps/api/src/services/file-uploader.ts:42*

---

### MAX_FILE_SIZE

**型**: `function`

**シグネチャ**:
```
function MAX_FILE_SIZE(...)
```

**説明**:

ファイルサイズ制限（デフォルト50MB）

*定義場所: apps/api/src/services/file-uploader.ts:52*

---

### uploadFile

**型**: `function`

**シグネチャ**:
```
function uploadFile(...)
```

**説明**:

ファイルをアップロードして保存する

*定義場所: apps/api/src/services/file-uploader.ts:57*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.ts:62*

---

### readFile

**型**: `function`

**シグネチャ**:
```
function readFile(...)
```

**説明**:

ファイルを読み込む

*定義場所: apps/api/src/services/file-uploader.ts:92*

---

### deleteFileFromDisk

**型**: `function`

**シグネチャ**:
```
function deleteFileFromDisk(...)
```

**説明**:

ファイルを削除する

*定義場所: apps/api/src/services/file-uploader.ts:102*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.ts:117*

---


## apps/api/src/services/llm/base.ts

### BaseLLMProvider

**型**: `class`

**シグネチャ**:
```
class BaseLLMProvider
```

*説明なし*

*定義場所: apps/api/src/services/llm/base.ts:6*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/base.ts:10*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/base.ts:21*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/base.ts:66*

---


## apps/api/src/services/llm/factory.ts

### createLLMProvider

**型**: `function`

**シグネチャ**:
```
function createLLMProvider(...)
```

**説明**:

LLMプロバイダーファクトリー

*定義場所: apps/api/src/services/llm/factory.ts:7*

---

### switch

**型**: `function`

**シグネチャ**:
```
function switch(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/factory.ts:11*

---

### getLLMConfigFromEnv

**型**: `function`

**シグネチャ**:
```
function getLLMConfigFromEnv()
```

**説明**:

環境変数からLLM設定を取得

*定義場所: apps/api/src/services/llm/factory.ts:23*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/factory.ts:32*

---

### getLLMConfig

**型**: `function`

**シグネチャ**:
```
function getLLMConfig()
```

**説明**:

データベースまたは環境変数からLLM設定を取得

*定義場所: apps/api/src/services/llm/factory.ts:46*

---


## apps/api/src/services/llm/ollama.ts

### OllamaProvider

**型**: `class`

**シグネチャ**:
```
class OllamaProvider
```

**説明**:

Ollama APIプロバイダー（ローカルLLM）

*定義場所: apps/api/src/services/llm/ollama.ts:4*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/ollama.ts:40*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/ollama.ts:55*

---


## apps/api/src/services/llm/openai-compatible.ts

### OpenAICompatibleProvider

**型**: `class`

**シグネチャ**:
```
class OpenAICompatibleProvider
```

**説明**:

OpenAI互換APIプロバイダー（LM Studio、LocalAIなど）
baseUrlが必須で、APIキーは通常不要

*定義場所: apps/api/src/services/llm/openai-compatible.ts:4*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai-compatible.ts:12*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai-compatible.ts:18*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai-compatible.ts:69*

---


## apps/api/src/services/llm/openai.ts

### OpenAIProvider

**型**: `class`

**シグネチャ**:
```
class OpenAIProvider
```

**説明**:

OpenAI APIプロバイダー（公式OpenAI API専用）

*定義場所: apps/api/src/services/llm/openai.ts:4*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai.ts:12*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai.ts:14*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/openai.ts:72*

---


## apps/api/src/services/llm/summarizer.ts

### NOTE_SUMMARY_PROMPT

**型**: `function`

**シグネチャ**:
```
function NOTE_SUMMARY_PROMPT(...)
```

**説明**:

ノート要約のプロンプトテンプレート

*定義場所: apps/api/src/services/llm/summarizer.ts:3*

---

### RSS_SUMMARY_PROMPT

**型**: `function`

**シグネチャ**:
```
function RSS_SUMMARY_PROMPT(...)
```

**説明**:

RSS記事要約のプロンプトテンプレート

*定義場所: apps/api/src/services/llm/summarizer.ts:11*

---

### KEY_POINTS_PROMPT

**型**: `function`

**シグネチャ**:
```
function KEY_POINTS_PROMPT(...)
```

**説明**:

要点抽出のプロンプトテンプレート

*定義場所: apps/api/src/services/llm/summarizer.ts:20*

---

### SummarizerService

**型**: `class`

**シグネチャ**:
```
class SummarizerService
```

**説明**:

ノート要約サービス

*定義場所: apps/api/src/services/llm/summarizer.ts:28*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/llm/summarizer.ts:32*

---


## apps/api/src/services/rss-fetcher.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.test.ts:47*

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


## apps/api/src/services/tag-suggestions.ts

### TAG_GENERATION_PROMPT

**型**: `function`

**シグネチャ**:
```
function TAG_GENERATION_PROMPT(...)
```

**説明**:

タグ候補生成の結果
/
export interface TagSuggestion {
/** タグ名 */
name: string;
/** 信頼度スコア（0-1） */
confidence: number;
/** 生成方法（'llm' | 'rule-based'） */
method: "llm" | "rule-based";
}

/**
LLMベースのタグ生成プロンプト

*定義場所: apps/api/src/services/tag-suggestions.ts:4*

---

### TagSuggestionService

**型**: `class`

**シグネチャ**:
```
class TagSuggestionService
```

**説明**:

タグ候補生成サービス

*定義場所: apps/api/src/services/tag-suggestions.ts:43*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:47*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:65*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:69*

---

### for

**型**: `method`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:253*

---


## apps/api/src/services/web-clip-fetcher.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.test.ts:64*

---


## apps/api/src/services/web-clip-fetcher.ts

### fetchHTML

**型**: `function`

**シグネチャ**:
```
function fetchHTML(...)
```

**説明**:

URLからHTMLを取得する

*定義場所: apps/api/src/services/web-clip-fetcher.ts:10*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:29*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:45*

---

### extractAndConvertToMarkdown

**型**: `function`

**シグネチャ**:
```
function extractAndConvertToMarkdown(...)
```

**説明**:

HTMLからメインコンテンツを抽出し、Markdownに変換する

*定義場所: apps/api/src/services/web-clip-fetcher.ts:54*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:82*

---

### fetchWebClip

**型**: `function`

**シグネチャ**:
```
function fetchWebClip(...)
```

**説明**:

Webクリップを取得し、ノートとして保存する

*定義場所: apps/api/src/services/web-clip-fetcher.ts:130*

---

### refetchWebClip

**型**: `function`

**シグネチャ**:
```
function refetchWebClip(...)
```

**説明**:

Webクリップを再取得して更新する

*定義場所: apps/api/src/services/web-clip-fetcher.ts:184*

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


## apps/web/src/lib/api.test.ts

### json

**型**: `function`

**シグネチャ**:
```
function json(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api.test.ts:30*

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
import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");

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

*定義場所: apps/web/src/lib/api.ts:22*

---

### getNotes

**型**: `function`

**シグネチャ**:
```
function getNotes(...)
```

**説明**:

ノート一覧取得

*定義場所: apps/web/src/lib/api.ts:32*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノート取得

*定義場所: apps/web/src/lib/api.ts:49*

---

### createNote

**型**: `function`

**シグネチャ**:
```
function createNote(...)
```

**説明**:

ノート作成

*定義場所: apps/web/src/lib/api.ts:56*

---

### updateNote

**型**: `function`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノート更新

*定義場所: apps/web/src/lib/api.ts:66*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノート削除

*定義場所: apps/web/src/lib/api.ts:76*

---

### createNoteMD

**型**: `function`

**シグネチャ**:
```
function createNoteMD(...)
```

**説明**:

Markdownノート作成

*定義場所: apps/web/src/lib/api.ts:85*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノート取得

*定義場所: apps/web/src/lib/api.ts:95*

---

### updateNoteMD

**型**: `function`

**シグネチャ**:
```
function updateNoteMD(...)
```

**説明**:

Markdownノート更新

*定義場所: apps/web/src/lib/api.ts:102*

---

### getTags

**型**: `function`

**シグネチャ**:
```
function getTags()
```

**説明**:

タグ一覧取得

*定義場所: apps/web/src/lib/api.ts:112*

---

### createTag

**型**: `function`

**シグネチャ**:
```
function createTag(...)
```

**説明**:

タグ作成

*定義場所: apps/web/src/lib/api.ts:119*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグ追加

*定義場所: apps/web/src/lib/api.ts:129*

---

### getTagsByNote

**型**: `function`

**シグネチャ**:
```
function getTagsByNote(...)
```

**説明**:

ノートに紐づくタグ一覧取得

*定義場所: apps/web/src/lib/api.ts:139*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグ削除

*定義場所: apps/web/src/lib/api.ts:146*

---

### deleteTag

**型**: `function`

**シグネチャ**:
```
function deleteTag(...)
```

**説明**:

タグ削除

*定義場所: apps/web/src/lib/api.ts:155*

---

### generateTagSuggestions

**型**: `function`

**シグネチャ**:
```
function generateTagSuggestions(...)
```

**説明**:

タグ候補生成

*定義場所: apps/web/src/lib/api.ts:164*

---

### getNoteLinks

**型**: `function`

**シグネチャ**:
```
function getNoteLinks(...)
```

**説明**:

ノートのリンク取得

*定義場所: apps/web/src/lib/api.ts:176*

---

### searchNotes

**型**: `function`

**シグネチャ**:
```
function searchNotes(...)
```

**説明**:

全文検索

*定義場所: apps/web/src/lib/api.ts:183*

---

### getRSSFeeds

**型**: `function`

**シグネチャ**:
```
function getRSSFeeds()
```

**説明**:

RSSフィード一覧取得

*定義場所: apps/web/src/lib/api.ts:200*

---

### createRSSFeed

**型**: `function`

**シグネチャ**:
```
function createRSSFeed(...)
```

**説明**:

RSSフィード登録

*定義場所: apps/web/src/lib/api.ts:207*

---

### deleteRSSFeed

**型**: `function`

**シグネチャ**:
```
function deleteRSSFeed(...)
```

**説明**:

RSSフィード削除

*定義場所: apps/web/src/lib/api.ts:217*

---

### fetchRSSFeed

**型**: `function`

**シグネチャ**:
```
function fetchRSSFeed(...)
```

**説明**:

RSSフィード取得・更新

*定義場所: apps/web/src/lib/api.ts:226*

---

### getRSSItem

**型**: `function`

**シグネチャ**:
```
function getRSSItem(...)
```

**説明**:

RSSアイテム取得（ノートIDで取得）

*定義場所: apps/web/src/lib/api.ts:236*

---

### createWebClip

**型**: `function`

**シグネチャ**:
```
function createWebClip(...)
```

**説明**:

Webクリップ作成

*定義場所: apps/web/src/lib/api.ts:243*

---

### getWebClips

**型**: `function`

**シグネチャ**:
```
function getWebClips(...)
```

**説明**:

Webクリップ一覧取得

*定義場所: apps/web/src/lib/api.ts:253*

---

### getWebClip

**型**: `function`

**シグネチャ**:
```
function getWebClip(...)
```

**説明**:

Webクリップ取得

*定義場所: apps/web/src/lib/api.ts:268*

---

### refetchWebClip

**型**: `function`

**シグネチャ**:
```
function refetchWebClip(...)
```

**説明**:

Webクリップ更新（再取得）

*定義場所: apps/web/src/lib/api.ts:275*

---

### deleteWebClip

**型**: `function`

**シグネチャ**:
```
function deleteWebClip(...)
```

**説明**:

Webクリップ削除

*定義場所: apps/web/src/lib/api.ts:284*

---

### uploadFile

**型**: `function`

**シグネチャ**:
```
function uploadFile(...)
```

**説明**:

ファイルアップロード

*定義場所: apps/web/src/lib/api.ts:293*

---

### getFiles

**型**: `function`

**シグネチャ**:
```
function getFiles(...)
```

**説明**:

ファイル一覧取得

*定義場所: apps/web/src/lib/api.ts:319*

---

### getFile

**型**: `function`

**シグネチャ**:
```
function getFile(...)
```

**説明**:

ファイル取得

*定義場所: apps/web/src/lib/api.ts:334*

---

### getFileDownloadUrl

**型**: `function`

**シグネチャ**:
```
function getFileDownloadUrl(...)
```

**説明**:

ファイルダウンロードURL取得

*定義場所: apps/web/src/lib/api.ts:341*

---

### deleteFile

**型**: `function`

**シグネチャ**:
```
function deleteFile(...)
```

**説明**:

ファイル削除

*定義場所: apps/web/src/lib/api.ts:350*

---

### linkFileToNote

**型**: `function`

**シグネチャ**:
```
function linkFileToNote(...)
```

**説明**:

ノートにファイルを関連付け

*定義場所: apps/web/src/lib/api.ts:359*

---

### unlinkFileFromNote

**型**: `function`

**シグネチャ**:
```
function unlinkFileFromNote(...)
```

**説明**:

ノートからファイルの関連を解除

*定義場所: apps/web/src/lib/api.ts:369*

---

### getFilesByNote

**型**: `function`

**シグネチャ**:
```
function getFilesByNote(...)
```

**説明**:

ノートに紐づくファイル一覧取得

*定義場所: apps/web/src/lib/api.ts:378*

---

### getMarkdownExportUrl

**型**: `function`

**シグネチャ**:
```
function getMarkdownExportUrl(...)
```

**説明**:

Markdownエクスポート

*定義場所: apps/web/src/lib/api.ts:389*

---

### getJSONExportUrl

**型**: `function`

**シグネチャ**:
```
function getJSONExportUrl()
```

**説明**:

JSONエクスポート

*定義場所: apps/web/src/lib/api.ts:402*

---

### syncPull

**型**: `function`

**シグネチャ**:
```
function syncPull(...)
```

**説明**:

同期プル

*定義場所: apps/web/src/lib/api.ts:411*

---

### syncPush

**型**: `function`

**シグネチャ**:
```
function syncPush(...)
```

**説明**:

同期プッシュ

*定義場所: apps/web/src/lib/api.ts:418*

---

### getLLMConfig

**型**: `function`

**シグネチャ**:
```
function getLLMConfig()
```

**説明**:

LLM設定取得（互換性のため残す）

*定義場所: apps/web/src/lib/api.ts:428*

---

### getLLMSettings

**型**: `function`

**シグネチャ**:
```
function getLLMSettings()
```

**説明**:

LLM設定取得（設定ページ用）

*定義場所: apps/web/src/lib/api.ts:435*

---

### saveLLMSettings

**型**: `function`

**シグネチャ**:
```
function saveLLMSettings(...)
```

**説明**:

LLM設定保存

*定義場所: apps/web/src/lib/api.ts:449*

---

### deleteLLMSettings

**型**: `function`

**シグネチャ**:
```
function deleteLLMSettings()
```

**説明**:

LLM設定削除

*定義場所: apps/web/src/lib/api.ts:466*

---

### summarizeNote

**型**: `function`

**シグネチャ**:
```
function summarizeNote(...)
```

**説明**:

ノート要約

*定義場所: apps/web/src/lib/api.ts:475*

---

### summarizeRSSArticle

**型**: `function`

**シグネチャ**:
```
function summarizeRSSArticle(...)
```

**説明**:

RSS記事要約

*定義場所: apps/web/src/lib/api.ts:484*

---

### extractKeyPoints

**型**: `function`

**シグネチャ**:
```
function extractKeyPoints(...)
```

**説明**:

要点抽出

*定義場所: apps/web/src/lib/api.ts:493*

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

*定義場所: apps/web/src/lib/storage.ts:37*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/storage.ts:41*

---

### upgrade

**型**: `function`

**シグネチャ**:
```
function upgrade(...)
```

*説明なし*

*定義場所: apps/web/src/lib/storage.ts:46*

---

### saveNote

**型**: `function`

**シグネチャ**:
```
function saveNote(...)
```

**説明**:

ノートを保存

*定義場所: apps/web/src/lib/storage.ts:85*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノートを取得

*定義場所: apps/web/src/lib/storage.ts:93*

---

### getAllNotes

**型**: `function`

**シグネチャ**:
```
function getAllNotes()
```

**説明**:

すべてのノートを取得

*定義場所: apps/web/src/lib/storage.ts:101*

---

### saveNoteMD

**型**: `function`

**シグネチャ**:
```
function saveNoteMD(...)
```

**説明**:

Markdownノートを保存

*定義場所: apps/web/src/lib/storage.ts:109*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノートを取得

*定義場所: apps/web/src/lib/storage.ts:117*

---

### saveRSSItem

**型**: `function`

**シグネチャ**:
```
function saveRSSItem(...)
```

**説明**:

RSSアイテムを保存

*定義場所: apps/web/src/lib/storage.ts:125*

---

### getRSSItem

**型**: `function`

**シグネチャ**:
```
function getRSSItem(...)
```

**説明**:

RSSアイテムを取得

*定義場所: apps/web/src/lib/storage.ts:133*

---

### saveTag

**型**: `function`

**シグネチャ**:
```
function saveTag(tag: Tag)
```

**説明**:

タグを保存

*定義場所: apps/web/src/lib/storage.ts:141*

---

### getAllTags

**型**: `function`

**シグネチャ**:
```
function getAllTags()
```

**説明**:

すべてのタグを取得

*定義場所: apps/web/src/lib/storage.ts:149*

---

### saveLink

**型**: `function`

**シグネチャ**:
```
function saveLink(...)
```

**説明**:

リンクを保存

*定義場所: apps/web/src/lib/storage.ts:157*

---

### getAllLinks

**型**: `function`

**シグネチャ**:
```
function getAllLinks()
```

**説明**:

すべてのリンクを取得

*定義場所: apps/web/src/lib/storage.ts:165*

---

### saveFeed

**型**: `function`

**シグネチャ**:
```
function saveFeed(...)
```

**説明**:

フィードを保存

*定義場所: apps/web/src/lib/storage.ts:173*

---

### getAllFeeds

**型**: `function`

**シグネチャ**:
```
function getAllFeeds()
```

**説明**:

すべてのフィードを取得

*定義場所: apps/web/src/lib/storage.ts:181*

---

### saveLastSync

**型**: `function`

**シグネチャ**:
```
function saveLastSync(...)
```

**説明**:

最終同期時刻を保存

*定義場所: apps/web/src/lib/storage.ts:189*

---

### getLastSync

**型**: `function`

**シグネチャ**:
```
function getLastSync()
```

**説明**:

最終同期時刻を取得

*定義場所: apps/web/src/lib/storage.ts:197*

---

### clearAll

**型**: `function`

**シグネチャ**:
```
function clearAll()
```

**説明**:

すべてのデータをクリア（デバッグ用）

*定義場所: apps/web/src/lib/storage.ts:206*

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

*定義場所: apps/web/static/sw.js:19*

---


## apps/web/vite.config.ts

### rewrite

**型**: `function`

**シグネチャ**:
```
function rewrite(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:16*

---

### configure

**型**: `function`

**シグネチャ**:
```
function configure(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:18*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:25*

---


## e2e/helpers.ts

### goToNotesList

**型**: `function`

**シグネチャ**:
```
function goToNotesList(...)
```

**説明**:

E2Eテスト用のヘルパー関数
/

/**
ノート一覧ページに移動

*定義場所: e2e/helpers.ts:3*

---

### goToNewNote

**型**: `function`

**シグネチャ**:
```
function goToNewNote(...)
```

**説明**:

新規ノート作成ページに移動

*定義場所: e2e/helpers.ts:15*

---

### goToNoteDetail

**型**: `function`

**シグネチャ**:
```
function goToNoteDetail(...)
```

**説明**:

ノート詳細ページに移動

*定義場所: e2e/helpers.ts:23*

---

### goToSearch

**型**: `function`

**シグネチャ**:
```
function goToSearch(...)
```

**説明**:

検索ページに移動

*定義場所: e2e/helpers.ts:31*

---

### goToRSS

**型**: `function`

**シグネチャ**:
```
function goToRSS(...)
```

**説明**:

RSS管理ページに移動

*定義場所: e2e/helpers.ts:39*

---

### goToTags

**型**: `function`

**シグネチャ**:
```
function goToTags(...)
```

**説明**:

タグ管理ページに移動

*定義場所: e2e/helpers.ts:47*

---

### createNote

**型**: `function`

**シグネチャ**:
```
function createNote(...)
```

**説明**:

新規ノートを作成

*定義場所: e2e/helpers.ts:55*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: e2e/helpers.ts:79*

---

### editNote

**型**: `function`

**シグネチャ**:
```
function editNote(...)
```

**説明**:

ノートを編集

*定義場所: e2e/helpers.ts:85*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノートを削除

*定義場所: e2e/helpers.ts:125*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグを追加
注意: タグは事前に作成されている必要があります

*定義場所: e2e/helpers.ts:142*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグを削除

*定義場所: e2e/helpers.ts:174*

---

### searchNotes

**型**: `function`

**シグネチャ**:
```
function searchNotes(...)
```

**説明**:

検索を実行

*定義場所: e2e/helpers.ts:192*

---

### createRSSFeed

**型**: `function`

**シグネチャ**:
```
function createRSSFeed(...)
```

**説明**:

RSSフィードを登録

*定義場所: e2e/helpers.ts:220*

---

### expectNoteInList

**型**: `function`

**シグネチャ**:
```
function expectNoteInList(...)
```

**説明**:

ノート一覧でノートが表示されているか確認

*定義場所: e2e/helpers.ts:250*

---

### expectNoteNotInList

**型**: `function`

**シグネチャ**:
```
function expectNoteNotInList(...)
```

**説明**:

ノート一覧でノートが表示されていないか確認

*定義場所: e2e/helpers.ts:259*

---


## e2e/search.spec.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: e2e/search.spec.ts:32*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: e2e/search.spec.ts:47*

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

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:35*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:48*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:62*

---
