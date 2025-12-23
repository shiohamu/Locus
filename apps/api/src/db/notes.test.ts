import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import * as notesDb from "./notes.js";
import { getDb } from "./db.js";

// getDb()をモックするために、元の実装を保存
const originalGetDb = getDb;

describe("notes", () => {
	let testDb: Client;
	let dbPath: string;
	let originalEnv: string | undefined;

	beforeEach(async () => {
		const result = await createTestDbFile();
		testDb = result.db;
		dbPath = result.path;

		// 環境変数を設定してgetDb()がテスト用データベースを使用するようにする
		originalEnv = process.env.DATABASE_URL;
		process.env.DATABASE_URL = `file:${dbPath}`;
	});

	afterEach(async () => {
		// 環境変数を復元
		if (originalEnv !== undefined) {
			process.env.DATABASE_URL = originalEnv;
		} else {
			delete process.env.DATABASE_URL;
		}

		await cleanupTestDbFile(testDb, dbPath);
	});

	test("createNote - ノートを作成できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		const created = await notesDb.createNote(note);
		expect(created).toEqual(note);
	});

	test("getNote - ノートを取得できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		await notesDb.createNote(note);
		const retrieved = await notesDb.getNote(note.id);

		expect(retrieved).not.toBeNull();
		expect(retrieved?.id).toBe(note.id);
		expect(retrieved?.title).toBe(note.title);
		expect(retrieved?.type).toBe(note.type);
	});

	test("getNote - 存在しないノートはnullを返す", async () => {
		const retrieved = await notesDb.getNote("non-existent-id");
		expect(retrieved).toBeNull();
	});

	test("updateNote - ノートを更新できる", async () => {
		const note = createTestNoteCore({
			title: "Original Title",
			type: "md",
		});

		await notesDb.createNote(note);

		const updated = {
			...note,
			title: "Updated Title",
			updated_at: Math.floor(Date.now() / 1000),
		};

		const result = await notesDb.updateNote(updated);
		expect(result.title).toBe("Updated Title");

		const retrieved = await notesDb.getNote(note.id);
		expect(retrieved?.title).toBe("Updated Title");
	});

	test("deleteNote - ノートを論理削除できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		await notesDb.createNote(note);

		const deletedAt = Math.floor(Date.now() / 1000);
		await notesDb.deleteNote(note.id, deletedAt);

		const retrieved = await notesDb.getNote(note.id);
		expect(retrieved).toBeNull(); // 論理削除されたノートは取得できない
	});

	test("listNotes - ノート一覧を取得できる", async () => {
		const note1 = createTestNoteCore({
			title: "Note 1",
			type: "md",
		});
		const note2 = createTestNoteCore({
			title: "Note 2",
			type: "rss",
		});

		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		const notes = await notesDb.listNotes({});
		expect(notes.length).toBe(2);
	});

	test("listNotes - タイプでフィルタリングできる", async () => {
		const note1 = createTestNoteCore({
			title: "Note 1",
			type: "md",
		});
		const note2 = createTestNoteCore({
			title: "Note 2",
			type: "rss",
		});

		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		const mdNotes = await notesDb.listNotes({ type: "md" });
		expect(mdNotes.length).toBe(1);
		expect(mdNotes[0].type).toBe("md");

		const rssNotes = await notesDb.listNotes({ type: "rss" });
		expect(rssNotes.length).toBe(1);
		expect(rssNotes[0].type).toBe("rss");
	});

	test("listNotes - limitとoffsetが機能する", async () => {
		// 複数のノートを作成
		for (let i = 0; i < 5; i++) {
			const note = createTestNoteCore({
				title: `Note ${i}`,
				type: "md",
			});
			await notesDb.createNote(note);
		}

		const notes = await notesDb.listNotes({ limit: 2, offset: 0 });
		expect(notes.length).toBe(2);

		const notesOffset = await notesDb.listNotes({ limit: 2, offset: 2 });
		expect(notesOffset.length).toBe(2);
		expect(notesOffset[0].id).not.toBe(notes[0].id);
	});
});

