import { openDB, type IDBPDatabase } from "idb";
import type {
	NoteCore,
	NoteMD,
	RSSItem,
	Tag,
	Link,
	RSSFeed,
} from "@locus/shared";

interface LocusDB {
	notes: {
		key: string;
		value: NoteCore;
	};
	notes_md: {
		key: string;
		value: NoteMD;
	};
	rss_items: {
		key: string;
		value: RSSItem;
	};
	tags: {
		key: string;
		value: Tag;
	};
	links: {
		key: string;
		value: Link;
	};
	feeds: {
		key: string;
		value: RSSFeed;
	};
	sync_state: {
		key: string;
		value: { last_sync: number };
	};
}

let db: IDBPDatabase<LocusDB> | null = null;

/**
 * IndexedDBを開く
 */
async function getDB(): Promise<IDBPDatabase<LocusDB>> {
	if (db) {
		return db;
	}

	db = await openDB<LocusDB>("locus", 1, {
		upgrade(database) {
			// ノートコア
			if (!database.objectStoreNames.contains("notes")) {
				database.createObjectStore("notes", { keyPath: "id" });
			}
			// Markdownノート
			if (!database.objectStoreNames.contains("notes_md")) {
				database.createObjectStore("notes_md", { keyPath: "note_id" });
			}
			// RSSアイテム
			if (!database.objectStoreNames.contains("rss_items")) {
				database.createObjectStore("rss_items", { keyPath: "note_id" });
			}
			// タグ
			if (!database.objectStoreNames.contains("tags")) {
				database.createObjectStore("tags", { keyPath: "id" });
			}
			// リンク
			if (!database.objectStoreNames.contains("links")) {
				const linkStore = database.createObjectStore("links", {
					keyPath: ["from_note_id", "to_note_id"],
				});
				linkStore.createIndex("from_note_id", "from_note_id");
				linkStore.createIndex("to_note_id", "to_note_id");
			}
			// フィード
			if (!database.objectStoreNames.contains("feeds")) {
				database.createObjectStore("feeds", { keyPath: "id" });
			}
			// 同期状態
			if (!database.objectStoreNames.contains("sync_state")) {
				database.createObjectStore("sync_state", { keyPath: "key" });
			}
		},
	});

	return db;
}

/**
 * ノートを保存
 */
export async function saveNote(note: NoteCore): Promise<void> {
	const database = await getDB();
	await database.put("notes", note);
}

/**
 * ノートを取得
 */
export async function getNote(id: string): Promise<NoteCore | undefined> {
	const database = await getDB();
	return database.get("notes", id);
}

/**
 * すべてのノートを取得
 */
export async function getAllNotes(): Promise<NoteCore[]> {
	const database = await getDB();
	return database.getAll("notes");
}

/**
 * Markdownノートを保存
 */
export async function saveNoteMD(noteMD: NoteMD): Promise<void> {
	const database = await getDB();
	await database.put("notes_md", noteMD);
}

/**
 * Markdownノートを取得
 */
export async function getNoteMD(noteId: string): Promise<NoteMD | undefined> {
	const database = await getDB();
	return database.get("notes_md", noteId);
}

/**
 * RSSアイテムを保存
 */
export async function saveRSSItem(item: RSSItem): Promise<void> {
	const database = await getDB();
	await database.put("rss_items", item);
}

/**
 * RSSアイテムを取得
 */
export async function getRSSItem(noteId: string): Promise<RSSItem | undefined> {
	const database = await getDB();
	return database.get("rss_items", noteId);
}

/**
 * タグを保存
 */
export async function saveTag(tag: Tag): Promise<void> {
	const database = await getDB();
	await database.put("tags", tag);
}

/**
 * すべてのタグを取得
 */
export async function getAllTags(): Promise<Tag[]> {
	const database = await getDB();
	return database.getAll("tags");
}

/**
 * リンクを保存
 */
export async function saveLink(link: Link): Promise<void> {
	const database = await getDB();
	await database.put("links", link);
}

/**
 * すべてのリンクを取得
 */
export async function getAllLinks(): Promise<Link[]> {
	const database = await getDB();
	return database.getAll("links");
}

/**
 * フィードを保存
 */
export async function saveFeed(feed: RSSFeed): Promise<void> {
	const database = await getDB();
	await database.put("feeds", feed);
}

/**
 * すべてのフィードを取得
 */
export async function getAllFeeds(): Promise<RSSFeed[]> {
	const database = await getDB();
	return database.getAll("feeds");
}

/**
 * 最終同期時刻を保存
 */
export async function saveLastSync(timestamp: number): Promise<void> {
	const database = await getDB();
	await database.put("sync_state", { key: "last_sync", last_sync: timestamp });
}

/**
 * 最終同期時刻を取得
 */
export async function getLastSync(): Promise<number | null> {
	const database = await getDB();
	const state = await database.get("sync_state", "last_sync");
	return state?.last_sync ?? null;
}

/**
 * すべてのデータをクリア（デバッグ用）
 */
export async function clearAll(): Promise<void> {
	const database = await getDB();
	await database.clear("notes");
	await database.clear("notes_md");
	await database.clear("rss_items");
	await database.clear("tags");
	await database.clear("links");
	await database.clear("feeds");
	await database.clear("sync_state");
}


