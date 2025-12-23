import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import * as searchDb from "./search.js";
import * as notesDb from "./notes.js";

describe("search", () => {
	let testDb: Client;
	let dbPath: string;
	let originalEnv: string | undefined;

	beforeEach(async () => {
		const result = await createTestDbFile();
		testDb = result.db;
		dbPath = result.path;

		originalEnv = process.env.DATABASE_URL;
		process.env.DATABASE_URL = `file:${dbPath}`;
	});

	afterEach(async () => {
		if (originalEnv !== undefined) {
			process.env.DATABASE_URL = originalEnv;
		} else {
			delete process.env.DATABASE_URL;
		}

		await cleanupTestDbFile(testDb, dbPath);
	});

	test("updateFTS - FTSインデックスを更新できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		await notesDb.createNote(note);
		await searchDb.updateFTS(note.id, "Test Note", "This is test content");

		// インデックスが更新されたことを確認（検索で確認）
		const results = await searchDb.searchNotes("test");
		expect(results.length).toBeGreaterThan(0);
		expect(results.some((r) => r.id === note.id)).toBe(true);
	});

	test("searchNotes - 全文検索が機能する", async () => {
		const note1 = createTestNoteCore({
			title: "JavaScript Tutorial",
			type: "md",
		});
		const note2 = createTestNoteCore({
			title: "Python Guide",
			type: "md",
		});

		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		await searchDb.updateFTS(note1.id, "JavaScript Tutorial", "Learn JavaScript programming");
		await searchDb.updateFTS(note2.id, "Python Guide", "Learn Python programming");

		const results = await searchDb.searchNotes("JavaScript");
		expect(results.length).toBe(1);
		expect(results[0].id).toBe(note1.id);
		expect(results[0].title).toBe("JavaScript Tutorial");
	});

	test("searchNotes - タイトルとコンテンツの両方を検索できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		await notesDb.createNote(note);
		await searchDb.updateFTS(note.id, "Test Note", "This note contains important information");

		// タイトルで検索
		const resultsByTitle = await searchDb.searchNotes("Test");
		expect(resultsByTitle.length).toBeGreaterThan(0);
		expect(resultsByTitle.some((r) => r.id === note.id)).toBe(true);

		// コンテンツで検索
		const resultsByContent = await searchDb.searchNotes("important");
		expect(resultsByContent.length).toBeGreaterThan(0);
		expect(resultsByContent.some((r) => r.id === note.id)).toBe(true);
	});

	test("searchNotes - limitとoffsetが機能する", async () => {
		// 複数のノートを作成
		for (let i = 0; i < 5; i++) {
			const note = createTestNoteCore({
				title: `Note ${i}`,
				type: "md",
			});
			await notesDb.createNote(note);
			await searchDb.updateFTS(note.id, `Note ${i}`, `Content ${i}`);
		}

		const results = await searchDb.searchNotes("Note", { limit: 2, offset: 0 });
		expect(results.length).toBe(2);

		const resultsOffset = await searchDb.searchNotes("Note", { limit: 2, offset: 2 });
		expect(resultsOffset.length).toBe(2);
		expect(resultsOffset[0].id).not.toBe(results[0].id);
	});

	test("searchNotes - 削除されたノートは検索結果に含まれない", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});

		await notesDb.createNote(note);
		await searchDb.updateFTS(note.id, "Test Note", "Test content");

		// 削除前は検索結果に含まれる
		let results = await searchDb.searchNotes("Test");
		expect(results.some((r) => r.id === note.id)).toBe(true);

		// ノートを削除
		const deletedAt = Math.floor(Date.now() / 1000);
		await notesDb.deleteNote(note.id, deletedAt);

		// 削除後は検索結果に含まれない
		results = await searchDb.searchNotes("Test");
		expect(results.some((r) => r.id === note.id)).toBe(false);
	});
});

