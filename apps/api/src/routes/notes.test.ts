import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import { app } from "../index.js";

describe("notes API", () => {
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

	test("GET /notes - ノート一覧を取得できる", async () => {
		const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
		const note2 = createTestNoteCore({ title: "Note 2", type: "rss" });

		// ノートを作成（直接DBに挿入）
		const { createNote } = await import("../db/notes.js");
		await createNote(note1);
		await createNote(note2);

		const res = await app.request("/notes");
		expect(res.status).toBe(200);

		const notes = await res.json();
		expect(Array.isArray(notes)).toBe(true);
		expect(notes.length).toBe(2);
	});

	test("GET /notes?type=md - タイプでフィルタリングできる", async () => {
		const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
		const note2 = createTestNoteCore({ title: "Note 2", type: "rss" });

		const { createNote } = await import("../db/notes.js");
		await createNote(note1);
		await createNote(note2);

		const res = await app.request("/notes?type=md");
		expect(res.status).toBe(200);

		const notes = await res.json();
		expect(notes.length).toBe(1);
		expect(notes[0].type).toBe("md");
	});

	test("POST /notes - ノートを作成できる", async () => {
		const note = createTestNoteCore({ title: "New Note", type: "md" });

		const res = await app.request("/notes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(note),
		});

		expect(res.status).toBe(201);

		const created = await res.json();
		expect(created.id).toBe(note.id);
		expect(created.title).toBe(note.title);
	});

	test("GET /notes/:id - ノートを取得できる", async () => {
		const note = createTestNoteCore({ title: "Test Note", type: "md" });

		const { createNote } = await import("../db/notes.js");
		await createNote(note);

		const res = await app.request(`/notes/${note.id}`);
		expect(res.status).toBe(200);

		const retrieved = await res.json();
		expect(retrieved.id).toBe(note.id);
		expect(retrieved.title).toBe(note.title);
	});

	test("GET /notes/:id - 存在しないノートは404を返す", async () => {
		const res = await app.request("/notes/non-existent-id");
		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("Note not found");
	});

	test("PUT /notes/:id - ノートを更新できる", async () => {
		const note = createTestNoteCore({ title: "Original Title", type: "md" });

		const { createNote } = await import("../db/notes.js");
		await createNote(note);

		const updated = {
			...note,
			title: "Updated Title",
			updated_at: Math.floor(Date.now() / 1000),
		};

		const res = await app.request(`/notes/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updated),
		});

		expect(res.status).toBe(200);

		const result = await res.json();
		expect(result.title).toBe("Updated Title");
	});

	test("DELETE /notes/:id - ノートを削除できる", async () => {
		const note = createTestNoteCore({ title: "Test Note", type: "md" });

		const { createNote } = await import("../db/notes.js");
		await createNote(note);

		const res = await app.request(`/notes/${note.id}`, {
			method: "DELETE",
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.message).toBe("Note deleted");

		// 削除後は取得できない
		const getRes = await app.request(`/notes/${note.id}`);
		expect(getRes.status).toBe(404);
	});
});


