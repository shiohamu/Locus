# API ドキュメント

自動生成日時: 2025-12-31 14:47:18

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
シングルトンパターンで同じインスタンスを再利用する

*定義場所: apps/api/src/db/db.ts:8*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/db.ts:33*

---

### closeDb

**型**: `function`

**シグネチャ**:
```
function closeDb()
```

**説明**:

データベース接続を閉じる（主にテスト用）

*定義場所: apps/api/src/db/db.ts:57*

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
@param file - 作成するファイルの情報（id, filename, mime_type, size, created_at, show_in_notesを含む）
@returns 作成されたファイル（入力と同じ）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/files.ts:9*

---

### getFile

**型**: `function`

**シグネチャ**:
```
function getFile(...)
```

**説明**:

ファイルを取得する
@param id - 取得するファイルのID
@returns ファイルが見つかった場合はFile、見つからない場合はnull
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/files.ts:34*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/files.ts:48*

---

### listFiles

**型**: `function`

**シグネチャ**:
```
function listFiles(...)
```

**説明**:

ファイル一覧を取得する
@param options - 取得オプション
@param options.limit - 取得件数の上限（デフォルト: 100）
@param options.offset - 取得開始位置（デフォルト: 0）
@returns ファイル一覧（created_atの降順でソート）

*定義場所: apps/api/src/db/files.ts:56*

---

### deleteFile

**型**: `function`

**シグネチャ**:
```
function deleteFile(...)
```

**説明**:

ファイルを削除する（物理削除）
@param id - 削除するファイルのID

*定義場所: apps/api/src/db/files.ts:84*

---

### linkFileToNote

**型**: `function`

**シグネチャ**:
```
function linkFileToNote(...)
```

**説明**:

ノートとファイルを関連付ける
@param fileId - 関連付けるファイルのID
@param noteId - 関連付けるノートのID
@returns 作成された関連付け情報

*定義場所: apps/api/src/db/files.ts:96*

---

### unlinkFileFromNote

**型**: `function`

**シグネチャ**:
```
function unlinkFileFromNote(...)
```

**説明**:

ノートとファイルの関連を解除する
@param fileId - 関連を解除するファイルのID
@param noteId - 関連を解除するノートのID

*定義場所: apps/api/src/db/files.ts:118*

---

### getFilesByNote

**型**: `function`

**シグネチャ**:
```
function getFilesByNote(...)
```

**説明**:

ノートに紐づくファイル一覧を取得する
@param noteId - ノートのID
@returns ノートに紐づくファイル一覧（created_atの降順でソート）

*定義場所: apps/api/src/db/files.ts:131*

---

### updateFile

**型**: `function`

**シグネチャ**:
```
function updateFile(...)
```

**説明**:

ファイルを更新する
@param id - 更新するファイルのID
@param updates - 更新するフィールド（filename, mime_type, size, created_at, show_in_notes）
@returns 更新されたファイル
@throws NotFoundError ファイルが見つからない場合
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/files.ts:153*

---

### getNoteIdsByFile

**型**: `function`

**シグネチャ**:
```
function getNoteIdsByFile(...)
```

**説明**:

ファイルに紐づくノートID一覧を取得する
@param fileId - ファイルのID
@returns ファイルに紐づくノートIDの配列

*定義場所: apps/api/src/db/files.ts:192*

---

### listFilesForNotes

**型**: `function`

**シグネチャ**:
```
function listFilesForNotes()
```

**説明**:

ノート一覧に表示するファイル一覧を取得する（show_in_notes = 1のファイルのみ）
@returns ノート一覧に表示するファイル一覧（created_atの降順でソート）

*定義場所: apps/api/src/db/files.ts:207*

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

*定義場所: apps/api/src/db/links.ts:5*

---

### getLinksByNote

**型**: `function`

**シグネチャ**:
```
function getLinksByNote(...)
```

**説明**:

ノートのリンクを取得する（双方向）

*定義場所: apps/api/src/db/links.ts:17*

---

### deleteLink

**型**: `function`

**シグネチャ**:
```
function deleteLink(...)
```

**説明**:

リンクを削除する

*定義場所: apps/api/src/db/links.ts:48*

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
@param note - 作成するノートの情報（id, type, title, created_at, updated_at, deleted_at, publicを含む）
@returns 作成されたノート（入力と同じ）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:8*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノートを取得する
@param id - 取得するノートのID
@returns ノートが見つかった場合はNoteCore、見つからない場合はnull
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:34*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes.ts:50*

---

### updateNote

**型**: `function`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノートを更新する
@param note - 更新するノートの情報（id, type, title, updated_at, deleted_at, publicを含む）
@returns 更新されたノート
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:58*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノートを削除する（論理削除）
@param id - 削除するノートのID
@param deletedAt - 削除日時（Unixタイムスタンプ）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:84*

---

### deleteNotesBatch

**型**: `function`

**シグネチャ**:
```
function deleteNotesBatch(...)
```

**説明**:

複数のノートを一括削除する（論理削除）
@param ids - 削除するノートのID配列
@param deletedAt - 削除日時（Unixタイムスタンプ）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:100*

---

### listNotes

**型**: `function`

**シグネチャ**:
```
function listNotes(...)
```

**説明**:

ノート一覧を取得する
@param options - 取得オプション
@param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
@param options.limit - 取得件数の上限（デフォルト: 100）
@param options.offset - 取得開始位置（デフォルト: 0）
@returns ノート一覧（updated_atの降順でソート）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/notes.ts:122*

---

### listNotesByTags

**型**: `function`

**シグネチャ**:
```
function listNotesByTags(...)
```

**説明**:

タグでフィルタリングされたノート一覧を取得する
複数のタグが指定された場合はOR条件（いずれかのタグが含まれている）
@param options - 取得オプション
@param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
@param options.tagNames - フィルタリングするタグ名の配列（空の場合は全ノートを返す）
@param options.limit - 取得件数の上限（デフォルト: 100）
@param options.offset - 取得開始位置（デフォルト: 0）
@returns タグでフィルタリングされたノート一覧（updated_atの降順でソート）

*定義場所: apps/api/src/db/notes.ts:160*

---

### listPublicNotes

**型**: `function`

**シグネチャ**:
```
function listPublicNotes(...)
```

**説明**:

公開ノート一覧を取得する
@param options - 取得オプション
@param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
@param options.limit - 取得件数の上限（デフォルト: 100）
@param options.offset - 取得開始位置（デフォルト: 0）
@returns 公開設定が有効なノート一覧（updated_atの降順でソート）

*定義場所: apps/api/src/db/notes.ts:216*

---

### getNotesWithTags

**型**: `function`

**シグネチャ**:
```
function getNotesWithTags(...)
```

**説明**:

ノート一覧とタグ情報を一度に取得する（最適化版）
ノートID -> タグ名の配列のマップを返す
@param options - 取得オプション
@param options.type - フィルタリングするノートタイプ（md, rss, web_clip）
@param options.tagNames - フィルタリングするタグ名の配列（空の場合は全ノートを返す）
@param options.limit - 取得件数の上限（デフォルト: 10000）
@param options.offset - 取得開始位置（デフォルト: 0）
@returns ノート一覧とタグマップ（ノートID -> タグ名の配列）

*定義場所: apps/api/src/db/notes.ts:252*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes.ts:302*

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

*定義場所: apps/api/src/db/notes_md.ts:5*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノートを取得する

*定義場所: apps/api/src/db/notes_md.ts:17*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/notes_md.ts:27*

---

### updateNoteMD

**型**: `function`

**シグネチャ**:
```
function updateNoteMD(...)
```

**説明**:

Markdownノートを更新する

*定義場所: apps/api/src/db/notes_md.ts:34*

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
@param feed - 作成するRSSフィードの情報（id, url, title, last_fetched_atを含む）
@returns 作成されたRSSフィード（入力と同じ）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/rss.ts:12*

---

### getFeed

**型**: `function`

**シグネチャ**:
```
function getFeed(...)
```

**説明**:

RSSフィードを取得する
@param id - 取得するRSSフィードのID
@returns RSSフィードが見つかった場合はRSSFeed、見つからない場合はnull
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/rss.ts:30*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/rss.ts:44*

---

### updateFeed

**型**: `function`

**シグネチャ**:
```
function updateFeed(...)
```

**説明**:

RSSフィードを更新する
@param feed - 更新するRSSフィードの情報（id, url, title, last_fetched_atを含む）
@returns 更新されたRSSフィード

*定義場所: apps/api/src/db/rss.ts:52*

---

### listFeeds

**型**: `function`

**シグネチャ**:
```
function listFeeds()
```

**説明**:

RSSフィード一覧を取得する
@returns RSSフィード一覧（titleの昇順でソート）

*定義場所: apps/api/src/db/rss.ts:66*

---

### createItem

**型**: `function`

**シグネチャ**:
```
function createItem(...)
```

**説明**:

RSSアイテムを作成する
@param item - 作成するRSSアイテムの情報（note_id, feed_id, url, content, published_atを含む）
@returns 作成されたRSSアイテム（入力と同じ）

*定義場所: apps/api/src/db/rss.ts:79*

---

### deleteFeed

**型**: `function`

**シグネチャ**:
```
function deleteFeed(...)
```

**説明**:

RSSフィードを削除する（物理削除）
@param id - 削除するRSSフィードのID

*定義場所: apps/api/src/db/rss.ts:94*

---

### getItemByNoteId

**型**: `function`

**シグネチャ**:
```
function getItemByNoteId(...)
```

**説明**:

ノートIDに基づいてRSSアイテムを取得する
@param noteId - ノートのID
@returns RSSアイテムが見つかった場合はRSSItem、見つからない場合はnull

*定義場所: apps/api/src/db/rss.ts:106*

---

### getItemsByFeed

**型**: `function`

**シグネチャ**:
```
function getItemsByFeed(...)
```

**説明**:

フィードIDに基づいてRSSアイテム一覧を取得する
@param feedId - RSSフィードのID
@returns RSSアイテム一覧（published_atの降順でソート）

*定義場所: apps/api/src/db/rss.ts:127*

---

### updateItem

**型**: `function`

**シグネチャ**:
```
function updateItem(...)
```

**説明**:

RSSアイテムのコンテンツを更新する
@param noteId - 更新するRSSアイテムのノートID
@param content - 新しいコンテンツ
@returns 更新されたRSSアイテム
@throws DatabaseError データベースエラーが発生した場合、または更新後のアイテムが見つからない場合

*定義場所: apps/api/src/db/rss.ts:145*

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

*定義場所: apps/api/src/db/search.ts:5*

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

*定義場所: apps/api/src/db/search.ts:29*

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

*定義場所: apps/api/src/db/settings.ts:5*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/settings.ts:15*

---

### setSetting

**型**: `function`

**シグネチャ**:
```
function setSetting(...)
```

**説明**:

設定を保存する

*定義場所: apps/api/src/db/settings.ts:22*

---

### getLLMConfig

**型**: `function`

**シグネチャ**:
```
function getLLMConfig()
```

**説明**:

LLM設定を取得する

*定義場所: apps/api/src/db/settings.ts:36*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/db/settings.ts:47*

---

### setLLMConfig

**型**: `function`

**シグネチャ**:
```
function setLLMConfig(...)
```

**説明**:

LLM設定を保存する

*定義場所: apps/api/src/db/settings.ts:56*

---

### deleteSetting

**型**: `function`

**シグネチャ**:
```
function deleteSetting(...)
```

**説明**:

設定を削除する

*定義場所: apps/api/src/db/settings.ts:63*

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

*定義場所: apps/api/src/db/tags.ts:6*

---

### getTag

**型**: `function`

**シグネチャ**:
```
function getTag(...)
```

**説明**:

タグを取得する

*定義場所: apps/api/src/db/tags.ts:18*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/tags.ts:28*

---

### getTagByName

**型**: `function`

**シグネチャ**:
```
function getTagByName(...)
```

**説明**:

タグ名でタグを取得する

*定義場所: apps/api/src/db/tags.ts:35*

---

### listTags

**型**: `function`

**シグネチャ**:
```
function listTags()
```

**説明**:

タグ一覧を取得する

*定義場所: apps/api/src/db/tags.ts:52*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグを追加する

*定義場所: apps/api/src/db/tags.ts:67*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグを削除する

*定義場所: apps/api/src/db/tags.ts:78*

---

### getTagsByNote

**型**: `function`

**シグネチャ**:
```
function getTagsByNote(...)
```

**説明**:

ノートに紐づくタグ一覧を取得する

*定義場所: apps/api/src/db/tags.ts:89*

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

*定義場所: apps/api/src/db/tags.ts:109*

---


## apps/api/src/db/utils/error-handler.ts

### handleDbOperation

**型**: `function`

**シグネチャ**:
```
function handleDbOperation(...)
```

**説明**:

データベース層でのエラーハンドリングユーティリティ
統一されたエラーハンドリングとログ記録を提供
/

import { DatabaseError, NotFoundError, ValidationError, toAppError } from "../../utils/errors.js";

/**
データベース操作を実行し、エラーを適切に処理する
@param operation 操作の説明（ログ用）
@param fn 実行するデータベース操作
@returns 操作の結果
@throws AppError エラーが発生した場合（元のエラー型を保持）

*定義場所: apps/api/src/db/utils/error-handler.ts:1*

---

### fn

**型**: `function`

**シグネチャ**:
```
function fn(...)
```

*説明なし*

*定義場所: apps/api/src/db/utils/error-handler.ts:15*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/db/utils/error-handler.ts:18*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/utils/error-handler.ts:20*

---

### handleDbOperationNullable

**型**: `function`

**シグネチャ**:
```
function handleDbOperationNullable(...)
```

**説明**:

データベース操作を実行し、エラーを適切に処理する（結果がnullの可能性がある場合）
@param operation 操作の説明（ログ用）
@param fn 実行するデータベース操作
@returns 操作の結果（nullの可能性あり）
@throws DatabaseError データベースエラーが発生した場合

*定義場所: apps/api/src/db/utils/error-handler.ts:64*

---


## apps/api/src/db/utils/mappers.ts

### mapRowToNoteCore

**型**: `function`

**シグネチャ**:
```
function mapRowToNoteCore(...)
```

**説明**:

データベース行からオブジェクトへのマッピング関数
型安全性を確保し、重複コードを削減する
/

import type { File, Link, NoteCore, NoteMD, RSSFeed, RSSItem, Tag, WebClip } from "@locus/shared";
import type { DbRow } from "./type-guards.js";
import { assertNoteType, assertNumber, assertNumberOrNull, assertString } from "./validators.js";

/**
NoteCoreにマッピングする
@param row データベース行
@returns NoteCoreオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:1*

---

### mapRowToTag

**型**: `function`

**シグネチャ**:
```
function mapRowToTag(...)
```

**説明**:

Tagにマッピングする
@param row データベース行
@returns Tagオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:27*

---

### mapRowToFile

**型**: `function`

**シグネチャ**:
```
function mapRowToFile(...)
```

**説明**:

Fileにマッピングする
@param row データベース行
@returns Fileオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:39*

---

### mapRowsToNoteCore

**型**: `function`

**シグネチャ**:
```
function mapRowsToNoteCore(...)
```

**説明**:

複数の行をNoteCoreの配列にマッピングする
@param rows データベース行の配列
@returns NoteCoreの配列

*定義場所: apps/api/src/db/utils/mappers.ts:59*

---

### mapRowsToTag

**型**: `function`

**シグネチャ**:
```
function mapRowsToTag(...)
```

**説明**:

複数の行をTagの配列にマッピングする
@param rows データベース行の配列
@returns Tagの配列

*定義場所: apps/api/src/db/utils/mappers.ts:68*

---

### mapRowsToFile

**型**: `function`

**シグネチャ**:
```
function mapRowsToFile(...)
```

**説明**:

複数の行をFileの配列にマッピングする
@param rows データベース行の配列
@returns Fileの配列

*定義場所: apps/api/src/db/utils/mappers.ts:77*

---

### mapRowToRSSFeed

**型**: `function`

**シグネチャ**:
```
function mapRowToRSSFeed(...)
```

**説明**:

RSSFeedにマッピングする
@param row データベース行
@returns RSSFeedオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:86*

---

### mapRowsToRSSFeed

**型**: `function`

**シグネチャ**:
```
function mapRowsToRSSFeed(...)
```

**説明**:

複数の行をRSSFeedの配列にマッピングする
@param rows データベース行の配列
@returns RSSFeedの配列

*定義場所: apps/api/src/db/utils/mappers.ts:100*

---

### mapRowToRSSItem

**型**: `function`

**シグネチャ**:
```
function mapRowToRSSItem(...)
```

**説明**:

RSSItemにマッピングする
@param row データベース行
@returns RSSItemオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:109*

---

### mapRowsToRSSItem

**型**: `function`

**シグネチャ**:
```
function mapRowsToRSSItem(...)
```

**説明**:

複数の行をRSSItemの配列にマッピングする
@param rows データベース行の配列
@returns RSSItemの配列

*定義場所: apps/api/src/db/utils/mappers.ts:124*

---

### mapRowToWebClip

**型**: `function`

**シグネチャ**:
```
function mapRowToWebClip(...)
```

**説明**:

WebClipにマッピングする
@param row データベース行
@returns WebClipオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:133*

---

### mapRowsToWebClip

**型**: `function`

**シグネチャ**:
```
function mapRowsToWebClip(...)
```

**説明**:

複数の行をWebClipの配列にマッピングする
@param rows データベース行の配列
@returns WebClipの配列

*定義場所: apps/api/src/db/utils/mappers.ts:147*

---

### mapRowToLink

**型**: `function`

**シグネチャ**:
```
function mapRowToLink(...)
```

**説明**:

Linkにマッピングする
@param row データベース行
@returns Linkオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:156*

---

### mapRowsToLink

**型**: `function`

**シグネチャ**:
```
function mapRowsToLink(...)
```

**説明**:

複数の行をLinkの配列にマッピングする
@param rows データベース行の配列
@returns Linkの配列

*定義場所: apps/api/src/db/utils/mappers.ts:168*

---

### mapRowToNoteMD

**型**: `function`

**シグネチャ**:
```
function mapRowToNoteMD(...)
```

**説明**:

NoteMDにマッピングする
@param row データベース行
@returns NoteMDオブジェクト

*定義場所: apps/api/src/db/utils/mappers.ts:177*

---

### mapRowsToNoteMD

**型**: `function`

**シグネチャ**:
```
function mapRowsToNoteMD(...)
```

**説明**:

複数の行をNoteMDの配列にマッピングする
@param rows データベース行の配列
@returns NoteMDの配列

*定義場所: apps/api/src/db/utils/mappers.ts:189*

---


## apps/api/src/db/utils/query-builder.ts

### QueryBuilder

**型**: `class`

**シグネチャ**:
```
class QueryBuilder
```

**説明**:

シンプルなSQLクエリビルダー
型安全性を確保し、SQLインジェクションを防ぐ
/

/**
クエリビルダークラス

*定義場所: apps/api/src/db/utils/query-builder.ts:1*

---

### createQueryBuilder

**型**: `function`

**シグネチャ**:
```
function createQueryBuilder()
```

**説明**:

SELECT句を設定
@param columns カラム名（配列または文字列）
@returns QueryBuilderインスタンス
/
select(columns: string | string[]): this {
if (Array.isArray(columns)) {
this.selectClause = `SELECT ${columns.join(", ")}`;
} else {
this.selectClause = `SELECT ${columns}`;
}
return this;
}

/**
FROM句を設定
@param table テーブル名
@param alias エイリアス（オプション）
@returns QueryBuilderインスタンス
/
from(table: string, alias?: string): this {
if (alias) {
this.fromClause = `FROM ${table} ${alias}`;
} else {
this.fromClause = `FROM ${table}`;
}
return this;
}

/**
WHERE句を追加
@param condition 条件（プレースホルダー付き）
@param value 値（オプション、条件にプレースホルダーがある場合）
@returns QueryBuilderインスタンス
/
where(condition: string, value?: unknown): this {
this.whereClauses.push(condition);
if (value !== undefined) {
this.args.push(value);
}
return this;
}

/**
AND条件を追加
@param condition 条件（プレースホルダー付き）
@param value 値（オプション、条件にプレースホルダーがある場合）
@returns QueryBuilderインスタンス
/
andWhere(condition: string, value?: unknown): this {
return this.where(condition, value);
}

/**
IN条件を追加
@param column カラム名
@param values 値の配列
@returns QueryBuilderインスタンス
/
whereIn(column: string, values: unknown[]): this {
if (values.length === 0) {
return this;
}
const placeholders = values.map(() => "?").join(", ");
this.whereClauses.push(`${column} IN (${placeholders})`);
this.args.push(...values);
return this;
}

/**
JOIN句を追加
@param table テーブル名
@param alias エイリアス
@param condition JOIN条件
@param joinType JOINタイプ（INNER, LEFT, RIGHTなど）
@returns QueryBuilderインスタンス
/
join(
table: string,
alias: string,
condition: string,
joinType: "INNER" | "LEFT" | "RIGHT" = "INNER"
): this {
this.fromClause += ` ${joinType} JOIN ${table} ${alias} ON ${condition}`;
return this;
}

/**
ORDER BY句を設定
@param column カラム名
@param direction ソート方向（ASC または DESC）
@returns QueryBuilderインスタンス
/
orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
this.orderByClause = `ORDER BY ${column} ${direction}`;
return this;
}

/**
LIMIT句を設定
@param limit 制限数
@param offset オフセット（オプション）
@returns QueryBuilderインスタンス
/
limit(limit: number, offset?: number): this {
this.limitClause = `LIMIT ?`;
this.args.push(limit);
if (offset !== undefined) {
this.limitClause += " OFFSET ?";
this.args.push(offset);
}
return this;
}

/**
DISTINCTを追加
@returns QueryBuilderインスタンス
/
distinct(): this {
this.selectClause = this.selectClause.replace("SELECT", "SELECT DISTINCT");
return this;
}

/**
SQLクエリを構築
@returns SQLクエリ文字列
/
toSQL(): string {
const parts: string[] = [];

if (this.selectClause) {
parts.push(this.selectClause);
}

if (this.fromClause) {
parts.push(this.fromClause);
}

if (this.whereClauses.length > 0) {
parts.push(`WHERE ${this.whereClauses.join(" AND ")}`);
}

if (this.orderByClause) {
parts.push(this.orderByClause);
}

if (this.limitClause) {
parts.push(this.limitClause);
}

return parts.join(" ");
}

/**
クエリパラメータを取得
@returns パラメータの配列
/
getArgs(): unknown[] {
return [...this.args];
}

/**
クエリをリセット
@returns QueryBuilderインスタンス
/
reset(): this {
this.selectClause = "";
this.fromClause = "";
this.whereClauses = [];
this.orderByClause = "";
this.limitClause = "";
this.args = [];
return this;
}
}

/**
新しいQueryBuilderインスタンスを作成
@returns QueryBuilderインスタンス

*定義場所: apps/api/src/db/utils/query-builder.ts:17*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/utils/query-builder.ts:38*

---


## apps/api/src/db/utils/type-guards.ts

### isString

**型**: `function`

**シグネチャ**:
```
function isString(...)
```

**説明**:

型ガード関数
実行時に型を安全に検証する
/

import type {
File,
LLMConfig,
Link,
NoteCore,
NoteMD,
NoteType,
RSSFeed,
RSSItem,
Tag,
WebClip,
} from "@locus/shared";

/**
データベース行の型定義
/
export interface DbRow {
[key: string]: unknown;
}

/**
文字列型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:1*

---

### isNumber

**型**: `function`

**シグネチャ**:
```
function isNumber(...)
```

**説明**:

数値型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:33*

---

### isNull

**型**: `function`

**シグネチャ**:
```
function isNull(...)
```

**説明**:

null型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:40*

---

### isObject

**型**: `function`

**シグネチャ**:
```
function isObject(...)
```

**説明**:

オブジェクト型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:47*

---

### isNoteType

**型**: `function`

**シグネチャ**:
```
function isNoteType(...)
```

**説明**:

NoteType型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:54*

---

### isNoteCoreRow

**型**: `function`

**シグネチャ**:
```
function isNoteCoreRow(...)
```

**説明**:

NoteCore行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:61*

---

### isTagRow

**型**: `function`

**シグネチャ**:
```
function isTagRow(...)
```

**説明**:

Tag行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:84*

---

### isFileRow

**型**: `function`

**シグネチャ**:
```
function isFileRow(...)
```

**説明**:

File行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:94*

---

### isRSSFeedRow

**型**: `function`

**シグネチャ**:
```
function isRSSFeedRow(...)
```

**説明**:

RSSFeed行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:115*

---

### isRSSItemRow

**型**: `function`

**シグネチャ**:
```
function isRSSItemRow(...)
```

**説明**:

RSSItem行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:132*

---

### isWebClipRow

**型**: `function`

**シグネチャ**:
```
function isWebClipRow(...)
```

**説明**:

WebClip行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:151*

---

### isLinkRow

**型**: `function`

**シグネチャ**:
```
function isLinkRow(...)
```

**説明**:

Link行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:168*

---

### isNoteMDRow

**型**: `function`

**シグネチャ**:
```
function isNoteMDRow(...)
```

**説明**:

NoteMD行の型ガード

*定義場所: apps/api/src/db/utils/type-guards.ts:178*

---


## apps/api/src/db/utils/validators.ts

### assertString

**型**: `function`

**シグネチャ**:
```
function assertString(...)
```

**説明**:

バリデーション関数
データベース行からオブジェクトへの変換時にバリデーションを実行
/

import type { LLMConfig, LLMProvider, NoteType } from "@locus/shared";
import { ValidationError } from "../../utils/errors.js";
import {
isLinkRow,
isNoteCoreRow,
isNoteMDRow,
isNoteType,
isNull,
isNumber,
isObject,
isRSSFeedRow,
isRSSItemRow,
isString,
isWebClipRow,
} from "./type-guards.js";

/**
型安全な文字列バリデーション
@param value 値
@param fieldName フィールド名（エラーメッセージ用）
@returns 文字列
@throws ValidationError 値が文字列でない場合

*定義場所: apps/api/src/db/utils/validators.ts:1*

---

### assertNumber

**型**: `function`

**シグネチャ**:
```
function assertNumber(...)
```

**説明**:

型安全な数値バリデーション
@param value 値
@param fieldName フィールド名（エラーメッセージ用）
@returns 数値
@throws ValidationError 値が数値でない場合

*定義場所: apps/api/src/db/utils/validators.ts:36*

---

### assertNumberOrNull

**型**: `function`

**シグネチャ**:
```
function assertNumberOrNull(...)
```

**説明**:

型安全なnull許容数値バリデーション
@param value 値
@param fieldName フィールド名（エラーメッセージ用）
@returns 数値またはnull
@throws ValidationError 値が数値またはnullでない場合

*定義場所: apps/api/src/db/utils/validators.ts:50*

---

### assertNoteType

**型**: `function`

**シグネチャ**:
```
function assertNoteType(...)
```

**説明**:

型安全なNoteTypeバリデーション
@param value 値
@param fieldName フィールド名（エラーメッセージ用）
@returns NoteType
@throws ValidationError 値がNoteTypeでない場合

*定義場所: apps/api/src/db/utils/validators.ts:69*

---

### assertNoteCoreRow

**型**: `function`

**シグネチャ**:
```
function assertNoteCoreRow(...)
```

**説明**:

NoteCore行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がNoteCoreの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:85*

---

### assertLinkRow

**型**: `function`

**シグネチャ**:
```
function assertLinkRow(...)
```

**説明**:

Link行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がLinkの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:100*

---

### assertNoteMDRow

**型**: `function`

**シグネチャ**:
```
function assertNoteMDRow(...)
```

**説明**:

NoteMD行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がNoteMDの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:115*

---

### assertRSSFeedRow

**型**: `function`

**シグネチャ**:
```
function assertRSSFeedRow(...)
```

**説明**:

RSSFeed行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がRSSFeedの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:130*

---

### assertRSSItemRow

**型**: `function`

**シグネチャ**:
```
function assertRSSItemRow(...)
```

**説明**:

RSSItem行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がRSSItemの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:145*

---

### assertWebClipRow

**型**: `function`

**シグネチャ**:
```
function assertWebClipRow(...)
```

**説明**:

WebClip行のバリデーション
@param row データベース行
@returns バリデーション済みの行
@throws ValidationError 行がWebClipの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:160*

---

### assertLLMProvider

**型**: `function`

**シグネチャ**:
```
function assertLLMProvider(...)
```

**説明**:

LLMProviderのバリデーション
@param value 値
@param fieldName フィールド名（エラーメッセージ用）
@returns LLMProvider
@throws ValidationError 値がLLMProviderでない場合

*定義場所: apps/api/src/db/utils/validators.ts:175*

---

### assertLLMConfig

**型**: `function`

**シグネチャ**:
```
function assertLLMConfig(...)
```

**説明**:

LLMConfigのバリデーション
@param value 値
@returns LLMConfig
@throws ValidationError 値がLLMConfigの形式でない場合

*定義場所: apps/api/src/db/utils/validators.ts:194*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/utils/validators.ts:213*

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

*定義場所: apps/api/src/db/web-clips.ts:5*

---

### getWebClip

**型**: `function`

**シグネチャ**:
```
function getWebClip(...)
```

**説明**:

Webクリップを取得する

*定義場所: apps/api/src/db/web-clips.ts:18*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/db/web-clips.ts:28*

---

### updateWebClip

**型**: `function`

**シグネチャ**:
```
function updateWebClip(...)
```

**説明**:

Webクリップを更新する

*定義場所: apps/api/src/db/web-clips.ts:35*

---

### listWebClips

**型**: `function`

**シグネチャ**:
```
function listWebClips(...)
```

**説明**:

Webクリップ一覧を取得する

*定義場所: apps/api/src/db/web-clips.ts:47*

---

### deleteWebClip

**型**: `function`

**シグネチャ**:
```
function deleteWebClip(...)
```

**説明**:

Webクリップを削除する

*定義場所: apps/api/src/db/web-clips.ts:68*

---


## apps/api/src/index.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:44*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/index.ts:65*

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

*定義場所: apps/api/src/middleware/error-handler.ts:16*

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


## apps/api/src/middleware/validation.test.ts

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/middleware/validation.test.ts:38*

---


## apps/api/src/middleware/validation.ts

### getQueryInt

**型**: `function`

**シグネチャ**:
```
function getQueryInt(...)
```

**説明**:

バリデーションミドルウェア
共通のバリデーションロジックを提供
/

import type { Context, Next } from "hono";
import { ValidationError } from "../utils/errors.js";

/**
クエリパラメータから数値を取得（オプショナル）

*定義場所: apps/api/src/middleware/validation.ts:1*

---

### getQueryIntRequired

**型**: `function`

**シグネチャ**:
```
function getQueryIntRequired(...)
```

**説明**:

クエリパラメータから必須の数値を取得

*定義場所: apps/api/src/middleware/validation.ts:22*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/middleware/validation.ts:27*

---

### getQueryString

**型**: `function`

**シグネチャ**:
```
function getQueryString(...)
```

**説明**:

クエリパラメータから文字列を取得（オプショナル）

*定義場所: apps/api/src/middleware/validation.ts:33*

---

### getQueryStringRequired

**型**: `function`

**シグネチャ**:
```
function getQueryStringRequired(...)
```

**説明**:

クエリパラメータから必須の文字列を取得

*定義場所: apps/api/src/middleware/validation.ts:40*

---

### getQueryStringArray

**型**: `function`

**シグネチャ**:
```
function getQueryStringArray(...)
```

**説明**:

クエリパラメータから文字列配列を取得（カンマ区切り）

*定義場所: apps/api/src/middleware/validation.ts:51*

---

### getJsonBody

**型**: `function`

**シグネチャ**:
```
function getJsonBody(...)
```

**説明**:

リクエストボディからJSONを取得し、バリデーションを実行

*定義場所: apps/api/src/middleware/validation.ts:63*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/middleware/validation.ts:69*

---

### validateRequired

**型**: `function`

**シグネチャ**:
```
function validateRequired(...)
```

**説明**:

リクエストボディから必須のフィールドを検証

*定義場所: apps/api/src/middleware/validation.ts:77*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/middleware/validation.ts:84*

---

### validateString

**型**: `function`

**シグネチャ**:
```
function validateString(...)
```

**説明**:

文字列フィールドのバリデーション

*定義場所: apps/api/src/middleware/validation.ts:91*

---

### validateArray

**型**: `function`

**シグネチャ**:
```
function validateArray(...)
```

**説明**:

配列フィールドのバリデーション

*定義場所: apps/api/src/middleware/validation.ts:111*

---

### validateUUID

**型**: `function`

**シグネチャ**:
```
function validateUUID(...)
```

**説明**:

UUID形式のバリデーション

*定義場所: apps/api/src/middleware/validation.ts:131*

---

### validateURL

**型**: `function`

**シグネチャ**:
```
function validateURL(...)
```

**説明**:

URL形式のバリデーション

*定義場所: apps/api/src/middleware/validation.ts:143*

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

*定義場所: apps/api/src/routes/export.ts:47*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/export.ts:118*

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

*定義場所: apps/api/src/routes/files.ts:28*

---


## apps/api/src/routes/graph.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/graph.test.ts:26*

---


## apps/api/src/routes/graph.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/graph.ts:42*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/graph.ts:84*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/graph.ts:107*

---


## apps/api/src/routes/links.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/links.test.ts:21*

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

*定義場所: apps/api/src/routes/llm.ts:79*

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

*定義場所: apps/api/src/routes/notes.ts:32*

---


## apps/api/src/routes/notes_md.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes_md.test.ts:24*

---


## apps/api/src/routes/notes_md.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes_md.ts:22*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/notes_md.ts:53*

---


## apps/api/src/routes/public.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/public.test.ts:35*

---


## apps/api/src/routes/public.ts

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/public.ts:33*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/public.ts:51*

---


## apps/api/src/routes/rss.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.test.ts:22*

---


## apps/api/src/routes/rss.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.ts:64*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/rss.ts:90*

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


## apps/api/src/routes/settings.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/settings.test.ts:21*

---


## apps/api/src/routes/settings.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/settings.ts:17*

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

*定義場所: apps/api/src/routes/sync.ts:22*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/routes/sync.ts:85*

---


## apps/api/src/routes/tags.test.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.test.ts:27*

---


## apps/api/src/routes/tags.ts

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.ts:71*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/routes/tags.ts:125*

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

*定義場所: apps/api/src/routes/web-clips.ts:70*

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

### JSONExportService

**型**: `class`

**シグネチャ**:
```
class JSONExportService
```

**説明**:

JSONエクスポートサービスの依存関係
/
export interface JSONExportDependencies {
filesDb: typeof filesDb;
linksDb: typeof linksDb;
notesDb: typeof notesDb;
notesMDDb: typeof notesMDDb;
rssDb: typeof rssDb;
tagsDb: typeof tagsDb;
webClipsDb: typeof webClipsDb;
}

/**
JSONエクスポートサービス

*定義場所: apps/api/src/services/export/json.ts:20*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:37*

---

### getDefaultJSONExportService

**型**: `function`

**シグネチャ**:
```
function getDefaultJSONExportService()
```

**説明**:

JSONエクスポートを生成
@param {Object} [options] - エクスポートオプション
@param {boolean} [options.includeFiles] - ファイルを含めるかどうか（デフォルト: true）
@param {string} [options.type] - ノートタイプでフィルタリング（'md' | 'rss' | 'web_clip'）
@param {string[]} [options.tags] - タグでフィルタリング
@param {number} [options.dateFrom] - 開始日時でフィルタリング（Unixタイムスタンプ）
@param {number} [options.dateTo] - 終了日時でフィルタリング（Unixタイムスタンプ）
@returns {Promise<{version: string, exported_at: number, notes: NoteCore[], notes_md: NoteMD[], tags: Tag[], links: Link[], rss_feeds: RSSFeed[], rss_items: RSSItem[], web_clips: WebClip[], files?: FileType[]}>} エクスポートデータ
/
async exportJSON(options?: {
includeFiles?: boolean;
type?: string;
tags?: string[];
dateFrom?: number;
dateTo?: number;
}): Promise<{
version: string;
exported_at: number;
notes: NoteCore[];
notes_md: NoteMD[];
tags: Tag[];
links: Link[];
rss_feeds: RSSFeed[];
rss_items: RSSItem[];
web_clips: WebClip[];
files?: FileType[];
}> {
return handleServiceOperation("exportJSON", async () => {
const now = Math.floor(Date.now() / 1000);

// 全データを取得（並列処理）
const [notesResult, tagsResult, feedsResult, filesResult] = await Promise.all([
this.deps.notesDb.listNotes({ limit: 10000 }),
this.deps.tagsDb.listTags(),
this.deps.rssDb.listFeeds(),
options?.includeFiles !== false
? this.deps.filesDb.listFiles({ limit: 10000 })
: Promise.resolve([]),
]);

let notes = notesResult;
const tags = tagsResult;
const feeds = feedsResult;
const files = filesResult;

// フィルタリング
if (options?.type) {
notes = notes.filter((note) => note.type === options.type);
}
if (options?.dateFrom) {
notes = notes.filter((note) => note.created_at >= options.dateFrom!);
}
if (options?.dateTo) {
notes = notes.filter((note) => note.created_at <= options.dateTo!);
}
if (options?.tags && options.tags.length > 0) {
const notesWithTags = await this.deps.notesDb.listNotesByTags({
tagNames: options.tags,
type: options.type as "md" | "rss" | "web_clip" | undefined,
limit: 10000,
});
const noteIds = new Set(notesWithTags.map((n) => n.id));
notes = notes.filter((note) => noteIds.has(note.id));
}

// ノートの詳細情報を取得（並列処理で最適化）
const noteDetailsPromises = notes.map(async (note) => {
try {
if (note.type === "md") {
const md = await this.deps.notesMDDb.getNoteMD(note.id);
return { type: "md" as const, data: md };
} else if (note.type === "rss") {
const item = await this.deps.rssDb.getItemByNoteId(note.id);
return { type: "rss" as const, data: item };
} else if (note.type === "web_clip") {
const clip = await this.deps.webClipsDb.getWebClip(note.id);
return { type: "web_clip" as const, data: clip };
}
return null;
} catch (error) {
console.error(`Failed to get details for note ${note.id}:`, error);
return null;
}
});

const noteDetailsResults = await Promise.all(noteDetailsPromises);
const notesMD: NoteMD[] = [];
const rssItems: RSSItem[] = [];
const webClips: WebClip[] = [];

for (const result of noteDetailsResults) {
if (!result) continue;
if (result.type === "md" && result.data) {
notesMD.push(result.data);
} else if (result.type === "rss" && result.data) {
rssItems.push(result.data);
} else if (result.type === "web_clip" && result.data) {
webClips.push(result.data);
}
}

// 全リンクを取得（並列処理で最適化）
const linkPromises = notes.map((note) => this.deps.linksDb.getLinksByNote(note.id));
const linkResults = await Promise.all(linkPromises);
const allLinks: Link[] = [];
for (const links of linkResults) {
allLinks.push(...links.outgoing);
}

// 重複を除去
const uniqueLinks = Array.from(
new Map(allLinks.map((link) => [`${link.from_note_id}-${link.to_note_id}`, link])).values()
);

const result: {
version: string;
exported_at: number;
notes: NoteCore[];
notes_md: NoteMD[];
tags: Tag[];
links: Link[];
rss_feeds: RSSFeed[];
rss_items: RSSItem[];
web_clips: WebClip[];
files?: FileType[];
} = {
version: "1.0",
exported_at: now,
notes,
notes_md: notesMD,
tags,
links: uniqueLinks,
rss_feeds: feeds,
rss_items: rssItems,
web_clips: webClips,
};

if (options?.includeFiles !== false) {
result.files = files;
}

return result;
});
}
}

/**
デフォルトの依存関係を使用するJSONエクスポートサービスインスタンス
/
let defaultJSONExportService: JSONExportService | null = null;

/**
デフォルトのJSONエクスポートサービスを取得

*定義場所: apps/api/src/services/export/json.ts:39*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:86*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:119*

---

### for

**型**: `method`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/json.ts:130*

---

### exportJSON

**型**: `function`

**シグネチャ**:
```
function exportJSON(...)
```

**説明**:

JSONエクスポートを生成（後方互換性のための関数）
@deprecated 新しいコードでは JSONExportService を直接使用してください

*定義場所: apps/api/src/services/export/json.ts:217*

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

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/markdown.ts:116*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/markdown.ts:129*

---


## apps/api/src/services/export/static-html.ts

### generateHTMLTemplate

**型**: `function`

**シグネチャ**:
```
function generateHTMLTemplate(...)
```

**説明**:

HTMLテンプレート（シンプルなWikiスタイル）

*定義場所: apps/api/src/services/export/static-html.ts:10*

---

### generateIndexHTML

**型**: `function`

**シグネチャ**:
```
function generateIndexHTML(...)
```

**説明**:

インデックスページのHTMLを生成

*定義場所: apps/api/src/services/export/static-html.ts:205*

---

### escapeHtml

**型**: `function`

**シグネチャ**:
```
function escapeHtml(...)
```

**説明**:

HTMLエスケープ

*定義場所: apps/api/src/services/export/static-html.ts:290*

---

### generateStaticHTML

**型**: `function`

**シグネチャ**:
```
function generateStaticHTML()
```

**説明**:

静的HTMLを生成

*定義場所: apps/api/src/services/export/static-html.ts:304*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/static-html.ts:317*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/export/static-html.ts:322*

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

### getFilesBaseDir

**型**: `function`

**シグネチャ**:
```
function getFilesBaseDir()
```

**説明**:

ファイル保存先のベースディレクトリを取得

*定義場所: apps/api/src/services/file-uploader.ts:8*

---

### ensureFilesDirectory

**型**: `function`

**シグネチャ**:
```
function ensureFilesDirectory()
```

**説明**:

ファイル保存ディレクトリを初期化

*定義場所: apps/api/src/services/file-uploader.ts:15*

---

### getFilePath

**型**: `function`

**シグネチャ**:
```
function getFilePath(...)
```

**説明**:

ファイル保存パスを取得

*定義場所: apps/api/src/services/file-uploader.ts:25*

---

### sanitizeFilename

**型**: `function`

**シグネチャ**:
```
function sanitizeFilename(...)
```

**説明**:

ファイル名をサニタイズ

*定義場所: apps/api/src/services/file-uploader.ts:37*

---

### isValidMimeType

**型**: `function`

**シグネチャ**:
```
function isValidMimeType(...)
```

**説明**:

MIMEタイプを検証

*定義場所: apps/api/src/services/file-uploader.ts:48*

---

### getMaxFileSize

**型**: `function`

**シグネチャ**:
```
function getMaxFileSize()
```

**説明**:

ファイルサイズ制限を取得（デフォルト50MB）

*定義場所: apps/api/src/services/file-uploader.ts:58*

---

### FileUploaderService

**型**: `class`

**シグネチャ**:
```
class FileUploaderService
```

**説明**:

ファイルアップロードサービスの依存関係
/
export interface FileUploaderDependencies {
filesDb: typeof filesDb;
}

/**
ファイルアップロードサービス

*定義場所: apps/api/src/services/file-uploader.ts:65*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.ts:76*

---

### getDefaultFileUploaderService

**型**: `function`

**シグネチャ**:
```
function getDefaultFileUploaderService()
```

**説明**:

ファイルをアップロードして保存する
@param {File} file - ファイルメタデータ
@param {ArrayBuffer} fileData - ファイルデータ
@returns {Promise<File>} 保存されたファイル情報
@throws {ValidationError} ファイルサイズが上限を超える場合、MIMEタイプが無効な場合
/
async uploadFile(file: File, fileData: ArrayBuffer): Promise<File> {
return handleServiceOperation(`uploadFile(${file.id})`, async () => {
const MAX_FILE_SIZE = getMaxFileSize();

// ファイルサイズチェック（file.sizeとfileData.byteLengthの両方をチェック）
const actualSize = fileData.byteLength;
if (file.size > MAX_FILE_SIZE || actualSize > MAX_FILE_SIZE) {
throw new ValidationError(
`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
{ fileId: file.id, size: actualSize, maxSize: MAX_FILE_SIZE }
);
}

// MIMEタイプ検証
if (!isValidMimeType(file.mime_type)) {
throw new ValidationError(`MIME type ${file.mime_type} is not allowed`, {
fileId: file.id,
mimeType: file.mime_type,
});
}

// ファイル名をサニタイズ
const sanitizedFilename = sanitizeFilename(file.filename);

// ファイル保存ディレクトリを確保
ensureFilesDirectory();

// ファイルを保存
const filePath = getFilePath(file.id, sanitizedFilename);
await Bun.write(filePath, fileData);

// データベースにメタデータを保存
const savedFile: File = {
...file,
filename: sanitizedFilename,
};

await this.deps.filesDb.createFile(savedFile);

return savedFile;
});
}

/**
ファイルを読み込む
@param {string} fileId - ファイルID
@param {string} filename - ファイル名
@returns {Promise<Buffer>} ファイルデータ
@throws {NotFoundError} ファイルが見つからない場合
/
async readFile(fileId: string, filename: string): Promise<Buffer> {
return handleServiceOperation(`readFile(${fileId})`, async () => {
const filePath = getFilePath(fileId, filename);
const file = Bun.file(filePath);
if (!(await file.exists())) {
throw new NotFoundError("File", fileId);
}
const arrayBuffer = await file.arrayBuffer();
return Buffer.from(arrayBuffer);
});
}

/**
ファイルを削除する
@param {string} fileId - ファイルID
@param {string} filename - ファイル名
@returns {Promise<void>}
@description ファイルシステムからファイルを削除し、空のディレクトリも削除します
/
async deleteFileFromDisk(fileId: string, filename: string): Promise<void> {
return handleServiceOperation(`deleteFileFromDisk(${fileId})`, async () => {
const filePath = getFilePath(fileId, filename);
const { unlink, rmdir } = await import("fs/promises");
try {
await unlink(filePath);
// ディレクトリが空なら削除
const baseDir = getFilesBaseDir();
const fileDir = join(baseDir, fileId);
try {
await rmdir(fileDir);
} catch {
// ディレクトリが空でない場合は無視
}
} catch (error) {
// ファイルが存在しない場合は無視
if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
throw error;
}
}
});
}
}

/**
デフォルトの依存関係を使用するファイルアップロードサービスインスタンス
/
let defaultFileUploaderService: FileUploaderService | null = null;

/**
デフォルトのファイルアップロードサービスを取得

*定義場所: apps/api/src/services/file-uploader.ts:78*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.ts:91*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/file-uploader.ts:168*

---

### uploadFile

**型**: `function`

**シグネチャ**:
```
function uploadFile(...)
```

**説明**:

ファイルをアップロードして保存する（後方互換性のための関数）
@deprecated 新しいコードでは FileUploaderService を直接使用してください

*定義場所: apps/api/src/services/file-uploader.ts:197*

---

### readFile

**型**: `function`

**シグネチャ**:
```
function readFile(...)
```

**説明**:

ファイルを読み込む（後方互換性のための関数）
@deprecated 新しいコードでは FileUploaderService を直接使用してください

*定義場所: apps/api/src/services/file-uploader.ts:206*

---

### deleteFileFromDisk

**型**: `function`

**シグネチャ**:
```
function deleteFileFromDisk(...)
```

**説明**:

ファイルを削除する（後方互換性のための関数）
@deprecated 新しいコードでは FileUploaderService を直接使用してください

*定義場所: apps/api/src/services/file-uploader.ts:215*

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

### RSSFetcherService

**型**: `class`

**シグネチャ**:
```
class RSSFetcherService
```

**説明**:

RSSフィード取得サービスの依存関係
/
export interface RSSFetcherDependencies {
notesDb: typeof notesDb;
rssDb: typeof rssDb;
searchDb: typeof searchDb;
}

/**
RSSフィード取得サービス

*定義場所: apps/api/src/services/rss-fetcher.ts:13*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:26*

---

### getDefaultRSSFetcherService

**型**: `function`

**シグネチャ**:
```
function getDefaultRSSFetcherService()
```

**説明**:

RSSフィードを取得し、ノートとして保存する
@param {RSSFeed} feed - 取得するRSSフィード
@returns {Promise<{created: number, updated: number}>} 作成されたアイテム数と更新されたアイテム数
@throws {ExternalServiceError} RSSフィードの取得・パースに失敗した場合
/
async fetchRSSFeed(feed: RSSFeed): Promise<{
created: number;
updated: number;
}> {
return handleServiceOperation(`fetchRSSFeed(${feed.id})`, async () => {
const now = Math.floor(Date.now() / 1000);

// RSSフィードを取得
let parsed;
try {
parsed = await parser.parseURL(feed.url);
} catch (error) {
throw new ExternalServiceError("RSS Parser", `Failed to parse RSS feed: ${feed.url}`, {
url: feed.url,
error: error instanceof Error ? error.message : String(error),
});
}

// 既存のアイテムを取得（重複チェック用）
const existingItems = await this.deps.rssDb.getItemsByFeed(feed.id);
const existingUrls = new Set(existingItems.map((item) => item.url));

let created = 0;
const updated = 0;

// 各アイテムを処理
for (const item of parsed.items) {
if (!item.link || !item.title) {
continue;
}

// 既に存在する場合はスキップ
if (existingUrls.has(item.link)) {
continue;
}

// 公開日時を取得
const publishedAt = item.pubDate
? Math.floor(new Date(item.pubDate).getTime() / 1000)
: now;

// HTMLコンテンツをMarkdownに変換
const content = item.contentSnippet || item.content || "";
const markdown = content ? turndownService.turndown(content) : item.title;

// ノートIDを生成
const noteId = crypto.randomUUID();

// ノートコアを作成
const noteCore: NoteCore = {
id: noteId,
type: "rss",
title: item.title,
created_at: publishedAt,
updated_at: publishedAt,
deleted_at: null,
};

// ノートを保存
await this.deps.notesDb.createNote(noteCore);

// RSSアイテムを作成
const rssItem: RSSItem = {
note_id: noteId,
feed_id: feed.id,
url: item.link,
content: markdown,
published_at: publishedAt,
};

await this.deps.rssDb.createItem(rssItem);

// FTSインデックスを更新
await this.deps.searchDb.updateFTS(noteId, item.title, markdown);

created++;
}

// フィードの最終取得日時を更新
const updatedFeed: RSSFeed = {
...feed,
last_fetched_at: now,
};
await this.deps.rssDb.updateFeed(updatedFeed);

return { created, updated };
});
}
}

/**
デフォルトの依存関係を使用するRSSフィード取得サービスインスタンス
/
let defaultRSSFetcherService: RSSFetcherService | null = null;

/**
デフォルトのRSSフィード取得サービスを取得

*定義場所: apps/api/src/services/rss-fetcher.ts:28*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:45*

---

### for

**型**: `method`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:60*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/rss-fetcher.ts:61*

---

### fetchRSSFeed

**型**: `function`

**シグネチャ**:
```
function fetchRSSFeed(...)
```

**説明**:

RSSフィードを取得し、ノートとして保存する（後方互換性のための関数）
@deprecated 新しいコードでは RSSFetcherService を直接使用してください

*定義場所: apps/api/src/services/rss-fetcher.ts:147*

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

*定義場所: apps/api/src/services/tag-suggestions.ts:6*

---

### TagSuggestionService

**型**: `class`

**シグネチャ**:
```
class TagSuggestionService
```

**説明**:

タグ候補生成サービスの依存関係
/
export interface TagSuggestionDependencies {
tagsDb: typeof tagsDb;
}

/**
タグ候補生成サービス

*定義場所: apps/api/src/services/tag-suggestions.ts:45*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:56*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:84*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:88*

---

### for

**型**: `method`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/tag-suggestions.ts:283*

---


## apps/api/src/services/utils/error-handler.ts

### handleServiceOperation

**型**: `function`

**シグネチャ**:
```
function handleServiceOperation(...)
```

**説明**:

サービス層でのエラーハンドリングユーティリティ
統一されたエラーハンドリングとログ記録を提供
/

import {
AppError,
DatabaseError,
ExternalServiceError,
NotFoundError,
TimeoutError,
ValidationError,
toAppError,
} from "../../utils/errors.js";

/**
サービス操作を実行し、エラーを適切に処理する
@param operation 操作の説明（ログ用）
@param fn 実行するサービス操作
@returns 操作の結果
@throws AppError エラーが発生した場合（元のエラー型を保持）

*定義場所: apps/api/src/services/utils/error-handler.ts:1*

---

### fn

**型**: `function`

**シグネチャ**:
```
function fn(...)
```

*説明なし*

*定義場所: apps/api/src/services/utils/error-handler.ts:25*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/utils/error-handler.ts:29*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/utils/error-handler.ts:31*

---

### handleServiceOperationNullable

**型**: `function`

**シグネチャ**:
```
function handleServiceOperationNullable(...)
```

**説明**:

サービス操作を実行し、エラーを適切に処理する（結果がnullの可能性がある場合）
@param operation 操作の説明（ログ用）
@param fn 実行するサービス操作
@returns 操作の結果（nullの可能性あり）
@throws AppError エラーが発生した場合

*定義場所: apps/api/src/services/utils/error-handler.ts:113*

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

### WebClipFetcherService

**型**: `class`

**シグネチャ**:
```
class WebClipFetcherService
```

**説明**:

Webクリップ取得サービスの依存関係
/
export interface WebClipFetcherDependencies {
notesDb: typeof notesDb;
webClipsDb: typeof webClipsDb;
searchDb: typeof searchDb;
}

/**
Webクリップ取得サービス

*定義場所: apps/api/src/services/web-clip-fetcher.ts:12*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:25*

---

### getDefaultWebClipFetcherService

**型**: `function`

**シグネチャ**:
```
function getDefaultWebClipFetcherService()
```

**説明**:

URLからHTMLを取得する
@param {string} url - 取得するURL
@returns {Promise<string>} HTMLコンテンツ
@throws {ExternalServiceError} HTTPエラー、タイムアウト、コンテンツサイズ超過の場合
@throws {ValidationError} コンテンツサイズが10MBを超える場合
/
private async fetchHTML(url: string): Promise<string> {
return handleServiceOperation(`fetchHTML(${url})`, async () => {
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

try {
const response = await fetch(url, {
signal: controller.signal,
headers: {
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
},
redirect: "follow",
});

clearTimeout(timeoutId);

if (!response.ok) {
throw new ExternalServiceError("HTTP", `HTTP error! status: ${response.status}`, {
url,
status: response.status,
});
}

// 最大10MBまで読み込む
const contentLength = response.headers.get("content-length");
if (contentLength && Number.parseInt(contentLength, 10) > 10 * 1024 * 1024) {
throw new ValidationError("Content too large (max 10MB)", { url, contentLength });
}

const text = await response.text();
if (text.length > 10 * 1024 * 1024) {
throw new ValidationError("Content too large (max 10MB)", { url, size: text.length });
}

return text;
} catch (error) {
clearTimeout(timeoutId);
if (error instanceof Error && error.name === "AbortError") {
throw new ExternalServiceError("HTTP", "Request timeout", { url });
}
throw error;
}
});
}

/**
HTMLからメインコンテンツを抽出し、Markdownに変換する
@param {string} html - HTMLコンテンツ
@param {string} url - 元のURL（メタデータ用）
@returns {{title: string, content: string}} 抽出されたタイトルとMarkdownコンテンツ
/
private extractAndConvertToMarkdown(
html: string,
url: string
): { title: string; content: string } {
// cheerioを使用してHTMLを解析
const $ = cheerio.load(html);

// タイトルを取得
const title = $("title").text().trim() || "Untitled";

// メインコンテンツを抽出
// article, main, [role="main"] などの要素を優先的に探す
let mainContent: cheerio.Cheerio<cheerio.Element> | null = null;

const selectors = [
"article",
"main",
'[role="main"]',
".content",
"#content",
".post",
".entry",
".article-content",
];

for (const selector of selectors) {
const found = $(selector);
if (found.length > 0) {
mainContent = found;
break;
}
}

// メインコンテンツが見つからない場合はbody全体を使用
if (!mainContent) {
mainContent = $("body");
}

// 不要な要素を削除
if (mainContent) {
// 広告、ナビゲーション、フッターなどを削除
const unwantedSelectors = [
"nav",
"header",
"footer",
".ad",
".advertisement",
".ads",
".sidebar",
".menu",
".navigation",
"script",
"style",
"noscript",
];

for (const selector of unwantedSelectors) {
mainContent.find(selector).remove();
}
}

// Markdownに変換
const htmlContent = mainContent ? mainContent.html() || "" : "";
const content = htmlContent ? turndownService.turndown(htmlContent) : "";

// ソースURLを追加
const contentWithSource = content
? `${content}\n\n---\n\nSource: [${title}](${url})`
: `Source: [${title}](${url})`;

return { title, content: contentWithSource };
}

/**
Webクリップを取得し、ノートとして保存する
@param {string} url - WebクリップするURL
@returns {Promise<{note: NoteCore, webClip: WebClip}>} 作成されたノートとWebクリップ情報
@throws {ValidationError} URLが無効な場合
@throws {ExternalServiceError} HTMLの取得に失敗した場合
/
async fetchWebClip(url: string): Promise<{
note: NoteCore;
webClip: WebClip;
}> {
return handleServiceOperation(`fetchWebClip(${url})`, async () => {
const now = Math.floor(Date.now() / 1000);

// URLのバリデーション
try {
new URL(url);
} catch {
throw new ValidationError("Invalid URL", { url });
}

// HTMLを取得
const html = await this.fetchHTML(url);

// HTMLからMarkdownに変換
const { title, content } = this.extractAndConvertToMarkdown(html, url);

// ノートIDを生成
const noteId = crypto.randomUUID();

// ノートコアを作成
const noteCore: NoteCore = {
id: noteId,
type: "web_clip",
title,
created_at: now,
updated_at: now,
deleted_at: null,
};

// ノートを保存
await this.deps.notesDb.createNote(noteCore);

// Webクリップを作成
const webClip: WebClip = {
note_id: noteId,
source_url: url,
fetched_at: now,
content,
};

await this.deps.webClipsDb.createWebClip(webClip);

// FTSインデックスを更新
await this.deps.searchDb.updateFTS(noteId, title, content);

return { note: noteCore, webClip };
});
}

/**
Webクリップを再取得して更新する
@param {string} noteId - ノートID（WebクリップIDと同じ）
@returns {Promise<{note: NoteCore, webClip: WebClip}>} 更新されたノートとWebクリップ情報
@throws {NotFoundError} Webクリップまたはノートが見つからない場合
@throws {ExternalServiceError} HTMLの再取得に失敗した場合
/
async refetchWebClip(noteId: string): Promise<{
note: NoteCore;
webClip: WebClip;
}> {
return handleServiceOperation(`refetchWebClip(${noteId})`, async () => {
// 既存のWebクリップを取得
const existing = await this.deps.webClipsDb.getWebClip(noteId);
if (!existing) {
throw new NotFoundError("Web clip", noteId);
}

const now = Math.floor(Date.now() / 1000);

// HTMLを再取得
const html = await this.fetchHTML(existing.source_url);

// HTMLからMarkdownに変換
const { title, content } = this.extractAndConvertToMarkdown(html, existing.source_url);

// ノートを更新
const note = await this.deps.notesDb.getNote(noteId);
if (!note) {
throw new NotFoundError("Note", noteId);
}

const updatedNote: NoteCore = {
...note,
title,
updated_at: now,
};

await this.deps.notesDb.updateNote(updatedNote);

// Webクリップを更新
const updatedWebClip: WebClip = {
...existing,
fetched_at: now,
content,
};

await this.deps.webClipsDb.updateWebClip(updatedWebClip);

// FTSインデックスを更新
await this.deps.searchDb.updateFTS(noteId, title, content);

return { note: updatedNote, webClip: updatedWebClip };
});
}
}

/**
デフォルトの依存関係を使用するWebクリップ取得サービスインスタンス
/
let defaultWebClipFetcherService: WebClipFetcherService | null = null;

/**
デフォルトのWebクリップ取得サービスを取得

*定義場所: apps/api/src/services/web-clip-fetcher.ts:27*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:51*

---

### catch

**型**: `method`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:70*

---

### for

**型**: `method`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/api/src/services/web-clip-fetcher.ts:111*

---

### fetchWebClip

**型**: `function`

**シグネチャ**:
```
function fetchWebClip(...)
```

**説明**:

Webクリップを取得し、ノートとして保存する（後方互換性のための関数）
@deprecated 新しいコードでは WebClipFetcherService を直接使用してください

*定義場所: apps/api/src/services/web-clip-fetcher.ts:299*

---

### refetchWebClip

**型**: `function`

**シグネチャ**:
```
function refetchWebClip(...)
```

**説明**:

Webクリップを再取得して更新する（後方互換性のための関数）
@deprecated 新しいコードでは WebClipFetcherService を直接使用してください

*定義場所: apps/api/src/services/web-clip-fetcher.ts:311*

---


## apps/api/src/utils/errors.ts

### AppError

**型**: `class`

**シグネチャ**:
```
class AppError
```

**説明**:

カスタムエラー型の定義
エラーの種類に応じた適切なHTTPステータスコードのマッピング
/

/**
ベースエラークラス

*定義場所: apps/api/src/utils/errors.ts:1*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/api/src/utils/errors.ts:10*

---

### DatabaseError

**型**: `class`

**シグネチャ**:
```
class DatabaseError
```

**説明**:

データベースエラー

*定義場所: apps/api/src/utils/errors.ts:22*

---

### NotFoundError

**型**: `class`

**シグネチャ**:
```
class NotFoundError
```

**説明**:

リソースが見つからないエラー

*定義場所: apps/api/src/utils/errors.ts:31*

---

### ValidationError

**型**: `class`

**シグネチャ**:
```
class ValidationError
```

**説明**:

バリデーションエラー

*定義場所: apps/api/src/utils/errors.ts:41*

---

### AuthenticationError

**型**: `class`

**シグネチャ**:
```
class AuthenticationError
```

**説明**:

認証エラー

*定義場所: apps/api/src/utils/errors.ts:50*

---

### AuthorizationError

**型**: `class`

**シグネチャ**:
```
class AuthorizationError
```

**説明**:

権限エラー

*定義場所: apps/api/src/utils/errors.ts:59*

---

### TimeoutError

**型**: `class`

**シグネチャ**:
```
class TimeoutError
```

**説明**:

タイムアウトエラー

*定義場所: apps/api/src/utils/errors.ts:68*

---

### ExternalServiceError

**型**: `class`

**シグネチャ**:
```
class ExternalServiceError
```

**説明**:

外部サービスエラー（LLM APIなど）

*定義場所: apps/api/src/utils/errors.ts:77*

---

### toAppError

**型**: `function`

**シグネチャ**:
```
function toAppError(...)
```

**説明**:

エラーをAppErrorに変換
@param error エラーオブジェクト
@returns AppError

*定義場所: apps/api/src/utils/errors.ts:89*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/api/src/utils/errors.ts:95*

---

### getStatusCode

**型**: `function`

**シグネチャ**:
```
function getStatusCode(...)
```

**説明**:

エラーからHTTPステータスコードを取得
@param error エラーオブジェクト
@returns HTTPステータスコード

*定義場所: apps/api/src/utils/errors.ts:129*

---

### getErrorCode

**型**: `function`

**シグネチャ**:
```
function getErrorCode(...)
```

**説明**:

エラーからエラーコードを取得
@param error エラーオブジェクト
@returns エラーコード

*定義場所: apps/api/src/utils/errors.ts:141*

---

### toErrorResponse

**型**: `function`

**シグネチャ**:
```
function toErrorResponse(...)
```

**説明**:

エラーレスポンスの形式
/
export interface ErrorResponse {
error: string;
code?: string;
details?: unknown;
stack?: string; // 開発環境のみ
}

/**
エラーをレスポンス形式に変換
@param error エラーオブジェクト
@param includeStack スタックトレースを含めるか（開発環境のみ）
@returns エラーレスポンス

*定義場所: apps/api/src/utils/errors.ts:153*

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


## apps/web/src/lib/api/base.ts

### getApiBaseUrl

**型**: `function`

**シグネチャ**:
```
function getApiBaseUrl()
```

**説明**:

API共通処理
/

import type { APIError } from "@locus/shared";
import { apiCache } from "./cache.js";

/**
APIベースURLを取得
@returns APIベースURL

*定義場所: apps/web/src/lib/api/base.ts:1*

---

### apiRequest

**型**: `function`

**シグネチャ**:
```
function apiRequest(...)
```

**説明**:

APIリクエストの共通処理
@param endpoint APIエンドポイント
@param options リクエストオプション
@param options.useCache キャッシュを使用するか（デフォルト: false）
@param options.cacheTTL キャッシュの有効期限（ミリ秒、デフォルト: 5分）
@returns レスポンスデータ
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/base.ts:16*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api/base.ts:38*

---


## apps/web/src/lib/api/cache.ts

### APICache

**型**: `class`

**シグネチャ**:
```
class APICache
```

**説明**:

APIリクエストキャッシュ
/

interface CacheEntry<T> {
data: T;
timestamp: number;
expiresAt: number;
}

/**
シンプルなメモリキャッシュ

*定義場所: apps/web/src/lib/api/cache.ts:1*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api/cache.ts:25*

---


## apps/web/src/lib/api/export.ts

### getMarkdownExportUrl

**型**: `function`

**シグネチャ**:
```
function getMarkdownExportUrl(...)
```

**説明**:

エクスポート関連API
/

import { getApiBaseUrl } from "./base.js";

/**
Markdownエクスポート

*定義場所: apps/web/src/lib/api/export.ts:1*

---

### getJSONExportUrl

**型**: `function`

**シグネチャ**:
```
function getJSONExportUrl()
```

**説明**:

JSONエクスポート

*定義場所: apps/web/src/lib/api/export.ts:18*

---


## apps/web/src/lib/api/files.ts

### uploadFile

**型**: `function`

**シグネチャ**:
```
function uploadFile(...)
```

**説明**:

ファイル関連API
/

import type { File as FileType } from "$lib/types";
import type { UploadFileResponse } from "$lib/types/api";
import type { APIError } from "@locus/shared";
import { apiRequest, getApiBaseUrl } from "./base.js";

/**
ファイルアップロード
@param file アップロードするファイル
@returns アップロードされたファイル情報
@throws {Error} アップロードに失敗した場合

*定義場所: apps/web/src/lib/api/files.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api/files.ts:27*

---

### getFiles

**型**: `function`

**シグネチャ**:
```
function getFiles(...)
```

**説明**:

ファイル一覧取得

*定義場所: apps/web/src/lib/api/files.ts:42*

---

### getFile

**型**: `function`

**シグネチャ**:
```
function getFile(...)
```

**説明**:

ファイル取得

*定義場所: apps/web/src/lib/api/files.ts:57*

---

### getFileDownloadUrl

**型**: `function`

**シグネチャ**:
```
function getFileDownloadUrl(...)
```

**説明**:

ファイルダウンロードURL取得

*定義場所: apps/web/src/lib/api/files.ts:64*

---

### deleteFile

**型**: `function`

**シグネチャ**:
```
function deleteFile(...)
```

**説明**:

ファイル削除

*定義場所: apps/web/src/lib/api/files.ts:71*

---

### linkFileToNote

**型**: `function`

**シグネチャ**:
```
function linkFileToNote(...)
```

**説明**:

ノートにファイルを関連付け

*定義場所: apps/web/src/lib/api/files.ts:80*

---

### unlinkFileFromNote

**型**: `function`

**シグネチャ**:
```
function unlinkFileFromNote(...)
```

**説明**:

ノートからファイルの関連を解除

*定義場所: apps/web/src/lib/api/files.ts:90*

---

### getFilesByNote

**型**: `function`

**シグネチャ**:
```
function getFilesByNote(...)
```

**説明**:

ノートに紐づくファイル一覧取得

*定義場所: apps/web/src/lib/api/files.ts:99*

---

### updateFile

**型**: `function`

**シグネチャ**:
```
function updateFile(...)
```

**説明**:

ファイル更新

*定義場所: apps/web/src/lib/api/files.ts:106*

---


## apps/web/src/lib/api/graph.ts

### getGraphData

**型**: `function`

**シグネチャ**:
```
function getGraphData(...)
```

**説明**:

グラフ関連API
/

import type { GraphEdge, GraphNode } from "$lib/types";
import { apiRequest } from "./base.js";

/**
グラフデータ取得
@param options 取得オプション
@param options.type ノートタイプ（"md" | "rss" | "web_clip"）
@param options.tags タグフィルター
@param options.limit 取得件数
@returns グラフデータ（ノードとエッジ）
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/graph.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api/graph.ts:31*

---


## apps/web/src/lib/api/llm.ts

### getLLMConfig

**型**: `function`

**シグネチャ**:
```
function getLLMConfig()
```

**説明**:

LLM関連API
/

import type { LLMConfig } from "$lib/types";
import type {
ExtractKeyPointsRequest,
ExtractKeyPointsResponse,
LLMSettingsResponse,
SaveLLMSettingsRequest,
SummaryResponse,
} from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
LLM設定取得（互換性のため残す）

*定義場所: apps/web/src/lib/api/llm.ts:1*

---

### getLLMSettings

**型**: `function`

**シグネチャ**:
```
function getLLMSettings()
```

**説明**:

LLM設定取得（設定ページ用）

*定義場所: apps/web/src/lib/api/llm.ts:22*

---

### saveLLMSettings

**型**: `function`

**シグネチャ**:
```
function saveLLMSettings(...)
```

**説明**:

LLM設定保存

*定義場所: apps/web/src/lib/api/llm.ts:29*

---

### deleteLLMSettings

**型**: `function`

**シグネチャ**:
```
function deleteLLMSettings()
```

**説明**:

LLM設定削除

*定義場所: apps/web/src/lib/api/llm.ts:39*

---

### summarizeNote

**型**: `function`

**シグネチャ**:
```
function summarizeNote(...)
```

**説明**:

ノート要約

*定義場所: apps/web/src/lib/api/llm.ts:48*

---

### summarizeRSSArticle

**型**: `function`

**シグネチャ**:
```
function summarizeRSSArticle(...)
```

**説明**:

RSS記事要約

*定義場所: apps/web/src/lib/api/llm.ts:57*

---

### extractKeyPoints

**型**: `function`

**シグネチャ**:
```
function extractKeyPoints(...)
```

**説明**:

要点抽出

*定義場所: apps/web/src/lib/api/llm.ts:66*

---


## apps/web/src/lib/api/notes.ts

### getNotes

**型**: `function`

**シグネチャ**:
```
function getNotes(...)
```

**説明**:

ノート関連API
/

import type { NoteCore, NoteMD } from "$lib/types";
import type {
CreateNoteMDRequest,
NoteLinksResponse,
TagSuggestionsResponse,
UpdateNoteMDRequest,
} from "$lib/types/api";
import { apiRequest } from "./base.js";
import { apiCache } from "./cache.js";

/**
ノート一覧取得
@param options 取得オプション
@param options.type ノートタイプ（"md" | "rss"）
@param options.limit 取得件数
@param options.offset オフセット
@returns ノート一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:1*

---

### getNote

**型**: `function`

**シグネチャ**:
```
function getNote(...)
```

**説明**:

ノート取得
@param id ノートID
@returns ノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:41*

---

### createNote

**型**: `function`

**シグネチャ**:
```
function createNote(...)
```

**説明**:

ノート作成
@param note ノート情報
@returns 作成されたノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:54*

---

### updateNote

**型**: `function`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノート更新
@param id ノートID
@param note 更新するノート情報
@returns 更新されたノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:70*

---

### deleteNote

**型**: `function`

**シグネチャ**:
```
function deleteNote(...)
```

**説明**:

ノート削除
@param id ノートID
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:88*

---

### deleteNotesBatch

**型**: `function`

**シグネチャ**:
```
function deleteNotesBatch(...)
```

**説明**:

ノート一括削除
@param noteIds ノートIDの配列
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:102*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/api/notes.ts:108*

---

### createNoteMD

**型**: `function`

**シグネチャ**:
```
function createNoteMD(...)
```

**説明**:

Markdownノート作成
@param data ノート作成データ
@returns 作成されたMarkdownノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:124*

---

### getNoteMD

**型**: `function`

**シグネチャ**:
```
function getNoteMD(...)
```

**説明**:

Markdownノート取得
@param noteId ノートID
@returns Markdownノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:140*

---

### updateNoteMD

**型**: `function`

**シグネチャ**:
```
function updateNoteMD(...)
```

**説明**:

Markdownノート更新
@param id ノートID
@param data 更新データ
@returns 更新されたMarkdownノート情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:153*

---

### getNoteLinks

**型**: `function`

**シグネチャ**:
```
function getNoteLinks(...)
```

**説明**:

ノートのリンク取得
@param noteId ノートID
@returns ノートのリンク一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:171*

---

### getNotesByTags

**型**: `function`

**シグネチャ**:
```
function getNotesByTags(...)
```

**説明**:

タグでフィルタリングされたノート一覧取得
@param options 取得オプション
@param options.tagNames タグ名の配列
@param options.type ノートタイプ（"md" | "rss"）
@param options.limit 取得件数
@param options.offset オフセット
@returns ノート一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:181*

---

### getNotesWithTags

**型**: `function`

**シグネチャ**:
```
function getNotesWithTags(...)
```

**説明**:

ノート一覧とタグ情報を一度に取得（最適化版）
@param options 取得オプション
@param options.tagNames タグ名の配列
@param options.type ノートタイプ（"md" | "rss"）
@param options.limit 取得件数
@param options.offset オフセット
@returns ノート一覧とタグマップ
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/notes.ts:212*

---


## apps/web/src/lib/api/rss.ts

### getRSSFeeds

**型**: `function`

**シグネチャ**:
```
function getRSSFeeds()
```

**説明**:

RSS関連API
/

import type { RSSFeed, RSSItem } from "$lib/types";
import type { CreateRSSFeedRequest, MessageResponse } from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
RSSフィード一覧取得

*定義場所: apps/web/src/lib/api/rss.ts:1*

---

### createRSSFeed

**型**: `function`

**シグネチャ**:
```
function createRSSFeed(...)
```

**説明**:

RSSフィード登録

*定義場所: apps/web/src/lib/api/rss.ts:16*

---

### deleteRSSFeed

**型**: `function`

**シグネチャ**:
```
function deleteRSSFeed(...)
```

**説明**:

RSSフィード削除

*定義場所: apps/web/src/lib/api/rss.ts:26*

---

### fetchRSSFeed

**型**: `function`

**シグネチャ**:
```
function fetchRSSFeed(...)
```

**説明**:

RSSフィード取得・更新

*定義場所: apps/web/src/lib/api/rss.ts:35*

---

### getRSSItem

**型**: `function`

**シグネチャ**:
```
function getRSSItem(...)
```

**説明**:

RSSアイテム取得（ノートIDで取得）

*定義場所: apps/web/src/lib/api/rss.ts:45*

---

### updateRSSItem

**型**: `function`

**シグネチャ**:
```
function updateRSSItem(...)
```

**説明**:

RSSアイテムのコンテンツを更新

*定義場所: apps/web/src/lib/api/rss.ts:52*

---


## apps/web/src/lib/api/search.ts

### searchNotes

**型**: `function`

**シグネチャ**:
```
function searchNotes(...)
```

**説明**:

検索関連API
/

import type { NoteCore } from "$lib/types";
import { apiRequest } from "./base.js";

/**
全文検索
@param query 検索クエリ
@param options 検索オプション
@param options.limit 取得件数
@param options.offset オフセット
@returns 検索結果のノート一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/search.ts:1*

---


## apps/web/src/lib/api/sync.ts

### syncPull

**型**: `function`

**シグネチャ**:
```
function syncPull(...)
```

**説明**:

同期関連API
/

import type { SyncPullResponse, SyncPushRequest } from "$lib/types";
import type { MessageResponse } from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
同期プル

*定義場所: apps/web/src/lib/api/sync.ts:1*

---

### syncPush

**型**: `function`

**シグネチャ**:
```
function syncPush(...)
```

**説明**:

同期プッシュ

*定義場所: apps/web/src/lib/api/sync.ts:16*

---


## apps/web/src/lib/api/tags.ts

### getTags

**型**: `function`

**シグネチャ**:
```
function getTags()
```

**説明**:

タグ関連API
/

import type { Tag } from "$lib/types";
import type { CreateTagRequest, TagSuggestionsResponse } from "$lib/types/api";
import { apiRequest } from "./base.js";

/**
タグ一覧取得
@returns タグ一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:1*

---

### createTag

**型**: `function`

**シグネチャ**:
```
function createTag(...)
```

**説明**:

タグ作成
@param tag タグ作成データ
@returns 作成されたタグ情報
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:21*

---

### addTagToNote

**型**: `function`

**シグネチャ**:
```
function addTagToNote(...)
```

**説明**:

ノートにタグ追加
@param noteId ノートID
@param tagId タグID
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:34*

---

### getTagsByNote

**型**: `function`

**シグネチャ**:
```
function getTagsByNote(...)
```

**説明**:

ノートに紐づくタグ一覧取得
@param noteId ノートID
@returns タグ一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:47*

---

### removeTagFromNote

**型**: `function`

**シグネチャ**:
```
function removeTagFromNote(...)
```

**説明**:

ノートからタグ削除
@param noteId ノートID
@param tagId タグID
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:57*

---

### deleteTag

**型**: `function`

**シグネチャ**:
```
function deleteTag(...)
```

**説明**:

タグ削除
@param tagId タグID
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:69*

---

### generateTagSuggestions

**型**: `function`

**シグネチャ**:
```
function generateTagSuggestions(...)
```

**説明**:

タグ候補生成
@param noteId ノートID
@returns タグ候補一覧
@throws {Error} APIエラーが発生した場合

*定義場所: apps/web/src/lib/api/tags.ts:80*

---


## apps/web/src/lib/api/web-clips.ts

### createWebClip

**型**: `function`

**シグネチャ**:
```
function createWebClip(...)
```

**説明**:

Webクリップ関連API
/

import type { WebClip } from "$lib/types";
import { apiRequest } from "./base.js";

/**
Webクリップ作成

*定義場所: apps/web/src/lib/api/web-clips.ts:1*

---

### getWebClips

**型**: `function`

**シグネチャ**:
```
function getWebClips(...)
```

**説明**:

Webクリップ一覧取得

*定義場所: apps/web/src/lib/api/web-clips.ts:18*

---

### getWebClip

**型**: `function`

**シグネチャ**:
```
function getWebClip(...)
```

**説明**:

Webクリップ取得

*定義場所: apps/web/src/lib/api/web-clips.ts:33*

---

### refetchWebClip

**型**: `function`

**シグネチャ**:
```
function refetchWebClip(...)
```

**説明**:

Webクリップ更新（再取得）

*定義場所: apps/web/src/lib/api/web-clips.ts:40*

---

### deleteWebClip

**型**: `function`

**シグネチャ**:
```
function deleteWebClip(...)
```

**説明**:

Webクリップ削除

*定義場所: apps/web/src/lib/api/web-clips.ts:49*

---


## apps/web/src/lib/hooks/useAutoSave.ts

### AutoSaveManager

**型**: `class`

**シグネチャ**:
```
class AutoSaveManager
```

**説明**:

自動保存カスタムフック
/

/**
自動保存の設定
/
export interface AutoSaveConfig {
/** 自動保存の遅延時間（ミリ秒） */
delay: number;
/** 変更がない場合に保存をスキップするか */
skipIfUnchanged: boolean;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
delay: 3000, // 3秒
skipIfUnchanged: true,
};

/**
自動保存マネージャー

*定義場所: apps/web/src/lib/hooks/useAutoSave.ts:1*

---

### constructor

**型**: `method`

**シグネチャ**:
```
function constructor(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useAutoSave.ts:29*

---

### onSave

**型**: `method`

**シグネチャ**:
```
function onSave(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useAutoSave.ts:39*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useAutoSave.ts:51*

---


## apps/web/src/lib/hooks/useNote.ts

### loadNoteData

**型**: `function`

**シグネチャ**:
```
function loadNoteData(...)
```

**説明**:

ノート管理カスタムフック

このフックは、ノートの読み込み、保存、削除のロジックを提供します。
Svelte 4では、関数ベースのアプローチを使用します。
/

import {
getNote,
getNoteMD,
getRSSItem,
getWebClip,
updateNote,
updateNoteMD,
updateRSSItem,
} from "$lib/api";
import type { NoteCore, NoteMD, RSSItem, WebClip } from "$lib/types";
import { nowTimestamp } from "$lib/utils";

export interface NoteData {
note: NoteCore | null;
noteMD: NoteMD | null;
rssItem: RSSItem | null;
webClip: WebClip | null;
}

/**
ノートを読み込む

*定義場所: apps/web/src/lib/hooks/useNote.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useNote.ts:33*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useNote.ts:62*

---

### saveNoteData

**型**: `function`

**シグネチャ**:
```
function saveNoteData(...)
```

**説明**:

ノートを保存する

*定義場所: apps/web/src/lib/hooks/useNote.ts:73*

---


## apps/web/src/lib/hooks/useNoteSummary.ts

### generateNoteSummary

**型**: `function`

**シグネチャ**:
```
function generateNoteSummary(...)
```

**説明**:

ノート要約カスタムフック
/

import { summarizeNote, summarizeRSSArticle } from "$lib/api";
import type { NoteCore } from "$lib/types";

/**
ノートの要約を生成

*定義場所: apps/web/src/lib/hooks/useNoteSummary.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/hooks/useNoteSummary.ts:17*

---


## apps/web/src/lib/services/filtering.ts

### filterNotes

**型**: `function`

**シグネチャ**:
```
function filterNotes(...)
```

**説明**:

フィルタリングサービス

ノートのフィルタリングロジックを提供します。
/

import type { NoteCore } from "$lib/types";

export type FilterType = "all" | "md" | "rss" | "web_clip";

/**
ノートをフィルタリングする
@param notes ノート一覧
@param filterType フィルタタイプ
@returns フィルタリングされたノート一覧

*定義場所: apps/web/src/lib/services/filtering.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/services/filtering.ts:18*

---

### getFilteredCount

**型**: `function`

**シグネチャ**:
```
function getFilteredCount(...)
```

**説明**:

フィルタリングされたノートの数を取得する
@param notes ノート一覧
@param filterType フィルタタイプ
@returns フィルタリングされたノートの数

*定義場所: apps/web/src/lib/services/filtering.ts:24*

---


## apps/web/src/lib/services/notes.ts

### NotesService

**型**: `class`

**シグネチャ**:
```
class NotesService
```

**説明**:

ノートサービス

ノート関連のビジネスロジックを提供します。
/

import { createNote, deleteNote, getNote, getNotes, updateNote } from "$lib/api";
import type { NoteCore } from "$lib/types";
import { type FilterType, filterNotes } from "./filtering";
import { paginate } from "./pagination";
import { type SortBy, type SortOrder, sortNotes } from "./sorting";

export interface NotesServiceOptions {
filterType?: FilterType;
sortBy?: SortBy;
sortOrder?: SortOrder;
currentPage?: number;
itemsPerPage?: number;
}

export interface NotesServiceResult {
notes: NoteCore[];
total: number;
}

/**
ノートサービス

*定義場所: apps/web/src/lib/services/notes.ts:1*

---

### if

**型**: `method`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/services/notes.ts:39*

---


## apps/web/src/lib/services/pagination.ts

### paginate

**型**: `function`

**シグネチャ**:
```
function paginate(...)
```

**説明**:

ページネーションサービス

配列のページネーションロジックを提供します。
/

/**
配列をページネーションする
@param items アイテム一覧
@param currentPage 現在のページ（1から始まる）
@param itemsPerPage 1ページあたりのアイテム数
@returns ページネーションされたアイテム一覧

*定義場所: apps/web/src/lib/services/pagination.ts:1*

---

### calculateTotalPages

**型**: `function`

**シグネチャ**:
```
function calculateTotalPages(...)
```

**説明**:

総ページ数を計算する
@param totalItems 総アイテム数
@param itemsPerPage 1ページあたりのアイテム数
@returns 総ページ数

*定義場所: apps/web/src/lib/services/pagination.ts:20*

---


## apps/web/src/lib/services/sorting.ts

### sortNotes

**型**: `function`

**シグネチャ**:
```
function sortNotes(...)
```

**説明**:

ソートサービス

ノートのソートロジックを提供します。
/

import type { NoteCore } from "$lib/types";

export type SortBy = "updated_at" | "created_at" | "title" | "tag";
export type SortOrder = "desc" | "asc";

/**
ノートをソートする
@param notes ノート一覧
@param sortBy ソート基準
@param sortOrder ソート順序
@param noteTagsMap ノートID -> タグ名の配列のマップ（タグソート時に使用）
@returns ソートされたノート一覧

*定義場所: apps/web/src/lib/services/sorting.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/services/sorting.ts:29*

---


## apps/web/src/lib/services/tags.ts

### TagsService

**型**: `class`

**シグネチャ**:
```
class TagsService
```

**説明**:

タグサービス

タグ関連のビジネスロジックを提供します。
/

import { createTag, deleteTag, getTags } from "$lib/api";
import type { CreateTagRequest } from "$lib/types/api";

/**
タグサービス

*定義場所: apps/web/src/lib/services/tags.ts:1*

---

### getTags

**型**: `method`

**シグネチャ**:
```
function getTags(...)
```

**説明**:

タグ一覧を取得する

*定義場所: apps/web/src/lib/services/tags.ts:14*

---

### createTag

**型**: `method`

**シグネチャ**:
```
function createTag(...)
```

**説明**:

タグを作成する

*定義場所: apps/web/src/lib/services/tags.ts:21*

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


## apps/web/src/lib/stores/notes.ts

### loadNotes

**型**: `method`

**シグネチャ**:
```
function loadNotes(...)
```

**説明**:

ノートストア

ノート一覧の状態管理を行います。
/

import { getNotesWithTags } from "$lib/api";
import { getFiles } from "$lib/api/files";
import { type FilterType, filterNotes } from "$lib/services/filtering";
import { type SortBy, type SortOrder, sortNotes } from "$lib/services/sorting";
import type { File, NoteCore } from "$lib/types";
import { derived, get, writable } from "svelte/store";

// 型を再エクスポート
export type { FilterType } from "$lib/services/filtering";
export type { SortBy, SortOrder } from "$lib/services/sorting";
import { calculateTotalPages, paginate } from "$lib/services/pagination";

export interface NotesState {
allNotes: NoteCore[];
allFiles: File[]; // ノート一覧に表示するファイル
noteTagsMap: Map<string, string[]>; // ノートID -> タグ名の配列
loading: boolean;
error: unknown | null;
filterType: FilterType;
filterTags: string[]; // タグフィルター
sortBy: SortBy;
sortOrder: SortOrder;
currentPage: number;
itemsPerPage: number;
}

const initialState: NotesState = {
allNotes: [],
allFiles: [],
noteTagsMap: new Map(),
loading: false,
error: null,
filterType: "all",
filterTags: [],
sortBy: "updated_at",
sortOrder: "desc",
currentPage: 1,
itemsPerPage: 20,
};

function createNotesStore() {
const store = writable<NotesState>(initialState);
const { subscribe, set, update } = store;

return {
subscribe,
/**
ノートを読み込む（最適化版：N+1クエリを解消）

*定義場所: apps/web/src/lib/stores/notes.ts:1*

---

### createNotesStore

**型**: `function`

**シグネチャ**:
```
function createNotesStore()
```

*説明なし*

*定義場所: apps/web/src/lib/stores/notes.ts:47*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: apps/web/src/lib/stores/notes.ts:74*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/web/src/lib/stores/notes.ts:91*

---

### setFilter

**型**: `method`

**シグネチャ**:
```
function setFilter(...)
```

**説明**:

フィルタを設定

*定義場所: apps/web/src/lib/stores/notes.ts:95*

---

### setTagFilter

**型**: `method`

**シグネチャ**:
```
function setTagFilter(...)
```

**説明**:

タグフィルターを設定

*定義場所: apps/web/src/lib/stores/notes.ts:101*

---

### setSort

**型**: `method`

**シグネチャ**:
```
function setSort(...)
```

**説明**:

ソートを設定

*定義場所: apps/web/src/lib/stores/notes.ts:107*

---

### setPage

**型**: `method`

**シグネチャ**:
```
function setPage(...)
```

**説明**:

ページを設定

*定義場所: apps/web/src/lib/stores/notes.ts:113*

---

### setItemsPerPage

**型**: `method`

**シグネチャ**:
```
function setItemsPerPage(...)
```

**説明**:

1ページあたりのアイテム数を設定

*定義場所: apps/web/src/lib/stores/notes.ts:119*

---

### addNote

**型**: `method`

**シグネチャ**:
```
function addNote(...)
```

**説明**:

ノートを追加（新規作成時など）

*定義場所: apps/web/src/lib/stores/notes.ts:125*

---

### updateNote

**型**: `method`

**シグネチャ**:
```
function updateNote(...)
```

**説明**:

ノートを更新

*定義場所: apps/web/src/lib/stores/notes.ts:134*

---

### removeNote

**型**: `method`

**シグネチャ**:
```
function removeNote(...)
```

**説明**:

ノートを削除

*定義場所: apps/web/src/lib/stores/notes.ts:143*

---

### reset

**型**: `method`

**シグネチャ**:
```
function reset(...)
```

**説明**:

リセット

*定義場所: apps/web/src/lib/stores/notes.ts:152*

---

### fileToNoteCore

**型**: `function`

**シグネチャ**:
```
function fileToNoteCore(...)
```

**説明**:

ファイルをNoteCore形式に変換（ノート一覧表示用）

*定義場所: apps/web/src/lib/stores/notes.ts:163*

---

### allItems

**型**: `function`

**シグネチャ**:
```
function allItems(...)
```

**説明**:

ノートとファイルを結合した全アイテムを導出（最適化：allNotes と allFiles が変更された場合のみ再計算）

*定義場所: apps/web/src/lib/stores/notes.ts:178*

---

### filteredItems

**型**: `function`

**シグネチャ**:
```
function filteredItems(...)
```

**説明**:

フィルタリングされたノートを導出（最適化：filterType が変更された場合のみ再計算）

*定義場所: apps/web/src/lib/stores/notes.ts:187*

---

### filteredNotes

**型**: `function`

**シグネチャ**:
```
function filteredNotes(...)
```

**説明**:

フィルタリング・ソート・ページネーションされたノートを導出
（最適化：sortBy, sortOrder, currentPage, itemsPerPage が変更された場合のみ再計算）

*定義場所: apps/web/src/lib/stores/notes.ts:195*

---

### totalPages

**型**: `function`

**シグネチャ**:
```
function totalPages(...)
```

**説明**:

総ページ数を導出（最適化：filteredItems の長さと itemsPerPage が変更された場合のみ再計算）

*定義場所: apps/web/src/lib/stores/notes.ts:205*

---

### filteredCount

**型**: `function`

**シグネチャ**:
```
function filteredCount(...)
```

**説明**:

フィルタリングされたノートの総数を導出（最適化：filteredItems の長さが変更された場合のみ再計算）

*定義場所: apps/web/src/lib/stores/notes.ts:212*

---


## apps/web/src/lib/stores/tags.ts

### loadTags

**型**: `method`

**シグネチャ**:
```
function loadTags(...)
```

**説明**:

タグストア

タグ一覧の状態管理を行います。
/

import { getTags } from "$lib/api";
import type { Tag } from "$lib/types";
import { writable } from "svelte/store";

export interface TagsState {
tags: Tag[];
loading: boolean;
error: unknown | null;
}

const initialState: TagsState = {
tags: [],
loading: false,
error: null,
};

function createTagsStore() {
const { subscribe, set, update } = writable<TagsState>(initialState);

return {
subscribe,
/**
タグを読み込む

*定義場所: apps/web/src/lib/stores/tags.ts:1*

---

### createTagsStore

**型**: `function`

**シグネチャ**:
```
function createTagsStore()
```

*説明なし*

*定義場所: apps/web/src/lib/stores/tags.ts:23*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: apps/web/src/lib/stores/tags.ts:36*

---

### addTag

**型**: `method`

**シグネチャ**:
```
function addTag(...)
```

**説明**:

タグを追加

*定義場所: apps/web/src/lib/stores/tags.ts:40*

---

### updateTag

**型**: `method`

**シグネチャ**:
```
function updateTag(...)
```

**説明**:

タグを更新

*定義場所: apps/web/src/lib/stores/tags.ts:49*

---

### removeTag

**型**: `method`

**シグネチャ**:
```
function removeTag(...)
```

**説明**:

タグを削除

*定義場所: apps/web/src/lib/stores/tags.ts:58*

---

### reset

**型**: `method`

**シグネチャ**:
```
function reset(...)
```

**説明**:

リセット

*定義場所: apps/web/src/lib/stores/tags.ts:67*

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
@param timestamp Unix timestamp（秒）
@returns Dateオブジェクト

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
@param date Dateオブジェクト
@returns Unix timestamp（秒）

*定義場所: apps/web/src/lib/utils.ts:14*

---

### nowTimestamp

**型**: `function`

**シグネチャ**:
```
function nowTimestamp()
```

**説明**:

現在のUnix timestamp（秒）を取得
@returns 現在のUnix timestamp（秒）

*定義場所: apps/web/src/lib/utils.ts:23*

---

### generateId

**型**: `function`

**シグネチャ**:
```
function generateId()
```

**説明**:

UUID v4を生成
@returns UUID v4文字列

*定義場所: apps/web/src/lib/utils.ts:31*

---

### formatDate

**型**: `function`

**シグネチャ**:
```
function formatDate(...)
```

**説明**:

日時をフォーマット
@param timestamp Unix timestamp（秒）、またはnull
@param defaultValue nullの場合に返すデフォルト値（デフォルト: ""）

*定義場所: apps/web/src/lib/utils.ts:39*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/utils.ts:45*

---


## apps/web/src/lib/utils/error-handling.ts

### handleApiError

**型**: `function`

**シグネチャ**:
```
function handleApiError(...)
```

**説明**:

エラーハンドリングユーティリティ
/

import { getErrorMessage as getErrorMessageFromMap } from "./error-messages";
import { logError } from "./logger";

/**
APIエラーを処理し、ユーザーフレンドリーなメッセージを返す
@param error エラーオブジェクト（Error、unknown、またはstring）
@param defaultMessage デフォルトのエラーメッセージ（エラーメッセージマッピングが使用できない場合）
@returns エラーメッセージ文字列

*定義場所: apps/web/src/lib/utils/error-handling.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/utils/error-handling.ts:25*

---

### getErrorMessage

**型**: `function`

**シグネチャ**:
```
function getErrorMessage(...)
```

**説明**:

エラーメッセージを取得（簡易版）
@param error エラーオブジェクト
@returns エラーメッセージ文字列

*定義場所: apps/web/src/lib/utils/error-handling.ts:32*

---

### getErrorType

**型**: `function`

**シグネチャ**:
```
function getErrorType(...)
```

**説明**:

エラーの種類を判定
/
export type ErrorType = "api" | "network" | "validation" | "unknown";

/**
エラーの種類を判定する
@param error エラーオブジェクト
@returns エラーの種類

*定義場所: apps/web/src/lib/utils/error-handling.ts:41*

---


## apps/web/src/lib/utils/error-messages.ts

### getErrorMessage

**型**: `function`

**シグネチャ**:
```
function getErrorMessage(...)
```

**説明**:

エラーメッセージマッピング

エラーの種類に応じたユーザーフレンドリーなメッセージを提供します。
/

import type { ErrorType } from "./error-handling";

export interface ErrorMessageMap {
[key: string]: string;
}

const errorMessages: Record<ErrorType, ErrorMessageMap> = {
network: {
default: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
timeout: "リクエストがタイムアウトしました。しばらくしてから再度お試しください。",
offline: "オフラインです。インターネット接続を確認してください。",
fetch: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
},
api: {
default: "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
notFound: "リソースが見つかりませんでした。",
unauthorized: "認証が必要です。ログインしてください。",
forbidden: "この操作を実行する権限がありません。",
badRequest: "リクエストが不正です。入力内容を確認してください。",
internalServerError: "サーバーエラーが発生しました。しばらくしてから再度お試しください。",
},
validation: {
default: "入力内容に誤りがあります。確認してください。",
required: "必須項目が入力されていません。",
invalid: "無効な値が入力されています。",
},
unknown: {
default: "予期しないエラーが発生しました。",
},
};

/**
エラーメッセージを取得する
@param error エラーオブジェクト
@param errorType エラーの種類
@returns エラーメッセージ文字列

*定義場所: apps/web/src/lib/utils/error-messages.ts:1*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/src/lib/utils/error-messages.ts:45*

---


## apps/web/src/lib/utils/logger.ts

### isDev

**型**: `function`

**シグネチャ**:
```
function isDev()
```

**説明**:

ロガーユーティリティ

エラーログの記録と管理を行います。
開発環境と本番環境で異なるログレベルを適用します。
/

/**
開発モードかどうかを取得する
SvelteKitが利用可能な場合は$app/environmentから取得し、
そうでない場合は環境変数から判定する

*定義場所: apps/web/src/lib/utils/logger.ts:1*

---

### Logger

**型**: `class`

**シグネチャ**:
```
class Logger
```

*説明なし*

*定義場所: apps/web/src/lib/utils/logger.ts:33*

---

### logError

**型**: `function`

**シグネチャ**:
```
function logError(...)
```

**説明**:

ログを記録する
/
private log(level: LogLevel, message: string, context?: LogContext): void {
// 本番環境ではdebugログを記録しない
if (!isDev() && level === "debug") {
return;
}

const timestamp = new Date().toISOString();
const logEntry = {
timestamp,
level,
message,
...context,
};

switch (level) {
case "error":
console.error(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
break;
case "warn":
console.warn(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
break;
default:
console.log(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
}

// 本番環境では、エラーログを外部サービスに送信する可能性がある
// TODO: エラートラッキングサービスへの送信（Sentry等）
if (!isDev() && level === "error") {
// 将来的にエラートラッキングサービスに送信
}
}

/**
デバッグログを記録する
/
debug(message: string, context?: LogContext): void {
this.log("debug", message, context);
}

/**
情報ログを記録する
/
info(message: string, context?: LogContext): void {
this.log("info", message, context);
}

/**
警告ログを記録する
/
warn(message: string, context?: LogContext): void {
this.log("warn", message, context);
}

/**
エラーログを記録する
/
error(message: string, error?: unknown, context?: LogContext): void {
const errorMessage = error instanceof Error ? error.message : String(error);
const errorContext = {
...context,
error:
error instanceof Error
? {
name: error.name,
message: error.message,
stack: error.stack,
}
: error,
};
this.log("error", errorMessage, errorContext);
}
}

export const logger = new Logger();

/**
エラーをログに記録する
@param error エラーオブジェクト
@param context 追加のコンテキスト情報

*定義場所: apps/web/src/lib/utils/logger.ts:34*

---

### switch

**型**: `method`

**シグネチャ**:
```
function switch(...)
```

*説明なし*

*定義場所: apps/web/src/lib/utils/logger.ts:51*

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

### manualChunks

**型**: `function`

**シグネチャ**:
```
function manualChunks(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:9*

---

### rewrite

**型**: `function`

**シグネチャ**:
```
function rewrite(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:33*

---

### configure

**型**: `function`

**シグネチャ**:
```
function configure(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:35*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: apps/web/vite.config.ts:42*

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


## scripts/deploy-public-site.ts

### deployPublicSite

**型**: `function`

**シグネチャ**:
```
function deployPublicSite()
```

**説明**:

公開サイトをデプロイ用ディレクトリに生成

*定義場所: scripts/deploy-public-site.ts:5*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: scripts/deploy-public-site.ts:23*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: scripts/deploy-public-site.ts:38*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: scripts/deploy-public-site.ts:44*

---


## scripts/migrate.ts

### parseSQL

**型**: `function`

**シグネチャ**:
```
function parseSQL(...)
```

**説明**:

SQLステートメントを解析して実行可能なステートメントの配列に分割

*定義場所: scripts/migrate.ts:5*

---

### if

**型**: `function`

**シグネチャ**:
```
function if(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:14*

---

### getAppliedMigrations

**型**: `function`

**シグネチャ**:
```
function getAppliedMigrations(...)
```

**説明**:

実行済みマイグレーションのバージョン一覧を取得

*定義場所: scripts/migrate.ts:25*

---

### catch

**型**: `function`

**シグネチャ**:
```
function catch(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:32*

---

### recordMigration

**型**: `function`

**シグネチャ**:
```
function recordMigration(...)
```

**説明**:

マイグレーションを実行済みとして記録

*定義場所: scripts/migrate.ts:38*

---

### columnExists

**型**: `function`

**シグネチャ**:
```
function columnExists(...)
```

**説明**:

テーブルにカラムが存在するかチェック

*定義場所: scripts/migrate.ts:49*

---

### safeAddColumn

**型**: `function`

**シグネチャ**:
```
function safeAddColumn(...)
```

**説明**:

ALTER TABLE ADD COLUMN文を安全に実行
カラムが既に存在する場合はスキップ

*定義場所: scripts/migrate.ts:63*

---

### migrate

**型**: `function`

**シグネチャ**:
```
function migrate()
```

**説明**:

データベースマイグレーションを実行する

*定義場所: scripts/migrate.ts:84*

---

### for

**型**: `function`

**シグネチャ**:
```
function for(...)
```

*説明なし*

*定義場所: scripts/migrate.ts:114*

---
