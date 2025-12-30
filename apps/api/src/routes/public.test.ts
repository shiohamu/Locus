import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import * as tagsDb from "../db/tags.js";
import { app } from "../index.js";
import {
	cleanupTestDbFile,
	createTestDbFile,
	createTestNoteCore,
	createTestTag,
} from "../test/helpers.js";

describe("public API", () => {
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
			process.env.DATABASE_URL = undefined;
		}

		await cleanupTestDbFile(testDb, dbPath);
	});

	test("GET /public/notes - 公開ノート一覧を取得できる", async () => {
		const publicNote = createTestNoteCore({
			title: "Public Note",
			type: "md",
			public: 1,
		});
		const privateNote = createTestNoteCore({
			title: "Private Note",
			type: "md",
			public: 0,
		});

		await notesDb.createNote(publicNote);
		await notesDb.createNote(privateNote);

		const res = await app.request("/public/notes");
		expect(res.status).toBe(200);

		const notes = await res.json();
		expect(Array.isArray(notes)).toBe(true);
		expect(notes.length).toBe(1);
		expect(notes[0].id).toBe(publicNote.id);
		expect(notes[0].title).toBe("Public Note");
	});

	test("GET /public/notes?type=md - タイプでフィルタリングできる", async () => {
		const mdNote = createTestNoteCore({
			title: "MD Note",
			type: "md",
			public: 1,
		});
		const rssNote = createTestNoteCore({
			title: "RSS Note",
			type: "rss",
			public: 1,
		});

		await notesDb.createNote(mdNote);
		await notesDb.createNote(rssNote);

		const res = await app.request("/public/notes?type=md");
		expect(res.status).toBe(200);

		const notes = await res.json();
		expect(notes.length).toBe(1);
		expect(notes[0].type).toBe("md");
	});

	test("GET /public/notes?limit=1&offset=0 - limitとoffsetでページネーションできる", async () => {
		const note1 = createTestNoteCore({
			title: "Note 1",
			type: "md",
			public: 1,
		});
		const note2 = createTestNoteCore({
			title: "Note 2",
			type: "md",
			public: 1,
		});

		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		const res = await app.request("/public/notes?limit=1&offset=0");
		expect(res.status).toBe(200);

		const notes = await res.json();
		expect(notes.length).toBe(1);
	});

	test("GET /public/notes/:id - 公開ノートの詳細を取得できる", async () => {
		const note = createTestNoteCore({
			title: "Public Note",
			type: "md",
			public: 1,
		});
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({
			note_id: note.id,
			content: "Public content",
		});

		const tag = createTestTag({ name: "public-tag" });
		await tagsDb.createTag(tag);
		await tagsDb.addTagToNote({ note_id: note.id, tag_id: tag.id });

		const res = await app.request(`/public/notes/${note.id}`);
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.note).toBeDefined();
		expect(body.note.id).toBe(note.id);
		expect(body.content).toBe("Public content");
		expect(Array.isArray(body.tags)).toBe(true);
		// タグが存在する場合のみ確認（リンクが正しく作成されていない可能性がある）
		const tagNames = body.tags.map((t: { name: string }) => t.name);
		expect(tagNames).toContain("public-tag");
	});

	test("GET /public/notes/:id - 存在しないノートは404を返す", async () => {
		const res = await app.request("/public/notes/non-existent-id");
		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("Note not found");
	});

	test("GET /public/notes/:id - 非公開ノートは403を返す", async () => {
		const note = createTestNoteCore({
			title: "Private Note",
			type: "md",
			public: 0,
		});
		await notesDb.createNote(note);

		const res = await app.request(`/public/notes/${note.id}`);
		expect(res.status).toBe(403);

		const body = await res.json();
		expect(body.error).toBe("Note is not public");
	});

	test("GET /public/notes/:id - Markdownノートのコンテンツが含まれる", async () => {
		const note = createTestNoteCore({
			title: "MD Note",
			type: "md",
			public: 1,
		});
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({
			note_id: note.id,
			content: "Markdown content",
		});

		const res = await app.request(`/public/notes/${note.id}`);
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.content).toBe("Markdown content");
		expect(body.metadata).toEqual({});
	});
});

