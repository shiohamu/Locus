import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import { app } from "../index.js";
import {
	cleanupTestDbFile,
	createTestDbFile,
	createTestNoteCore,
} from "../test/helpers.js";

describe("notes_md API", () => {
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

	test("GET /notes/md/:id - Markdownノートを取得できる", async () => {
		const note = createTestNoteCore({ title: "Test Note", type: "md" });
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({ note_id: note.id, content: "Test content" });

		const res = await app.request(`/notes/md/${note.id}`);
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.note_id).toBe(note.id);
		expect(body.content).toBe("Test content");
	});

	test("GET /notes/md/:id - 存在しないノートは404を返す", async () => {
		const res = await app.request("/notes/md/non-existent-id");
		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("Markdown note not found");
	});

	test("POST /notes/md - Markdownノートを作成できる", async () => {
		const note = createTestNoteCore({ title: "New Note", type: "md" });
		const noteMD = { note_id: note.id, content: "New content" };

		const res = await app.request("/notes/md", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ core: note, md: noteMD }),
		});

		expect(res.status).toBe(201);

		const body = await res.json();
		expect(body.core.id).toBe(note.id);
		expect(body.md.content).toBe("New content");

		// ノートが作成されたことを確認
		const created = await notesDb.getNote(note.id);
		expect(created).not.toBeNull();
		expect(created?.title).toBe("New Note");

		// Markdownノートが作成されたことを確認
		const createdMD = await notesMDDb.getNoteMD(note.id);
		expect(createdMD).not.toBeNull();
		expect(createdMD?.content).toBe("New content");
	});

	test("POST /notes/md - リンクが検出されて登録される", async () => {
		const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
		const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
		await notesDb.createNote(note1);
		await notesDb.createNote(note2);

		const note3 = createTestNoteCore({ title: "Note 3", type: "md" });
		const noteMD = {
			note_id: note3.id,
			content: `This is a note with a link to [[${note1.id}]] and [[${note2.id}]]`,
		};

		const res = await app.request("/notes/md", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ core: note3, md: noteMD }),
		});

		expect(res.status).toBe(201);

		// リンクが作成されたことを確認
		const links = await linksDb.getLinksByNote(note3.id);
		expect(links.outgoing.length).toBe(2);
		expect(links.outgoing.some((l) => l.to_note_id === note1.id)).toBe(true);
		expect(links.outgoing.some((l) => l.to_note_id === note2.id)).toBe(true);
	});

	test("PUT /notes/md/:id - Markdownノートを更新できる", async () => {
		const note = createTestNoteCore({ title: "Original Title", type: "md" });
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({ note_id: note.id, content: "Original content" });

		const res = await app.request(`/notes/md/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				core: { title: "Updated Title" },
				md: { content: "Updated content" },
			}),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.core.title).toBe("Updated Title");
		expect(body.md.content).toBe("Updated content");

		// ノートが更新されたことを確認
		const updated = await notesDb.getNote(note.id);
		expect(updated?.title).toBe("Updated Title");

		// Markdownノートが更新されたことを確認
		const updatedMD = await notesMDDb.getNoteMD(note.id);
		expect(updatedMD?.content).toBe("Updated content");
	});

	test("PUT /notes/md/:id - ノートコアのみを更新できる", async () => {
		const note = createTestNoteCore({ title: "Original Title", type: "md" });
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({ note_id: note.id, content: "Original content" });

		const res = await app.request(`/notes/md/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				core: { title: "Updated Title" },
			}),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.core.title).toBe("Updated Title");
		expect(body.md.content).toBe("Original content"); // 変更されていない
	});

	test("PUT /notes/md/:id - Markdownノートのみを更新できる", async () => {
		const note = createTestNoteCore({ title: "Original Title", type: "md" });
		await notesDb.createNote(note);
		await notesMDDb.createNoteMD({ note_id: note.id, content: "Original content" });

		const res = await app.request(`/notes/md/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				md: { content: "Updated content" },
			}),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.core.title).toBe("Original Title"); // 変更されていない
		expect(body.md.content).toBe("Updated content");
	});

	test("PUT /notes/md/:id - 存在しないノートは404を返す", async () => {
		const res = await app.request("/notes/md/non-existent-id", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				core: { title: "Updated Title" },
			}),
		});

		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("Note not found");
	});

	test("PUT /notes/md/:id - 存在しないMarkdownノートは404を返す", async () => {
		const note = createTestNoteCore({ title: "Test Note", type: "md" });
		await notesDb.createNote(note);
		// Markdownノートは作成しない

		const res = await app.request(`/notes/md/${note.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				md: { content: "Updated content" },
			}),
		});

		expect(res.status).toBe(404);

		const body = await res.json();
		expect(body.error).toBe("Markdown note not found");
	});

	test("PUT /notes/md/:id - リンクが更新される", async () => {
		const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
		const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
		const note3 = createTestNoteCore({ title: "Note 3", type: "md" });
		await notesDb.createNote(note1);
		await notesDb.createNote(note2);
		await notesDb.createNote(note3);

		// 最初のリンクを作成
		await notesMDDb.createNoteMD({
			note_id: note1.id,
			content: `Link to [[${note2.id}]]`,
		});
		await linksDb.createLink({ from_note_id: note1.id, to_note_id: note2.id });

		// リンクを更新
		const res = await app.request(`/notes/md/${note1.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				md: { content: `Link to [[${note3.id}]]` },
			}),
		});

		expect(res.status).toBe(200);

		// 古いリンクが削除され、新しいリンクが作成されたことを確認
		const links = await linksDb.getLinksByNote(note1.id);
		expect(links.outgoing.length).toBe(1);
		expect(links.outgoing[0].to_note_id).toBe(note3.id);
	});
});

