import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore, createTestTag } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import { app } from "../index.js";

describe("tags API", () => {
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

	test("GET /tags - タグ一覧を取得できる", async () => {
		const tag1 = createTestTag({ name: "tag1" });
		const tag2 = createTestTag({ name: "tag2" });

		const { createTag } = await import("../db/tags.js");
		await createTag(tag1);
		await createTag(tag2);

		const res = await app.request("/tags");
		expect(res.status).toBe(200);

		const tags = await res.json();
		expect(Array.isArray(tags)).toBe(true);
		expect(tags.length).toBe(2);
	});

	test("POST /tags - タグを作成できる", async () => {
		const res = await app.request("/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "new-tag" }),
		});

		expect(res.status).toBe(201);

		const created = await res.json();
		expect(created.name).toBe("new-tag");
		expect(created.id).toBeDefined();
	});

	test("POST /tags - 既存のタグ名は409を返す", async () => {
		const tag = createTestTag({ name: "existing-tag" });

		const { createTag } = await import("../db/tags.js");
		await createTag(tag);

		const res = await app.request("/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "existing-tag" }),
		});

		expect(res.status).toBe(409);

		const body = await res.json();
		expect(body.error).toBe("このタグは既に存在します");
	});

	test("GET /notes/:id/tags - ノートに紐づくタグ一覧を取得できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag = createTestTag({ name: "test-tag" });

		const { createNote } = await import("../db/notes.js");
		const { createTag, addTagToNote } = await import("../db/tags.js");
		await createNote(note);
		await createTag(tag);
		await addTagToNote({ note_id: note.id, tag_id: tag.id });

		const res = await app.request(`/notes/${note.id}/tags`);
		expect(res.status).toBe(200);

		const tags = await res.json();
		expect(Array.isArray(tags)).toBe(true);
		expect(tags.length).toBe(1);
		expect(tags[0].id).toBe(tag.id);
	});

	test("POST /notes/:id/tags - ノートにタグを追加できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag = createTestTag({ name: "test-tag" });

		const { createNote } = await import("../db/notes.js");
		const { createTag } = await import("../db/tags.js");
		await createNote(note);
		await createTag(tag);

		const res = await app.request(`/notes/${note.id}/tags`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tag_id: tag.id }),
		});

		expect(res.status).toBe(201);

		const body = await res.json();
		expect(body.message).toBe("Tag added to note");
	});

	test("DELETE /notes/:id/tags/:tag - ノートからタグを削除できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag = createTestTag({ name: "test-tag" });

		const { createNote } = await import("../db/notes.js");
		const { createTag, addTagToNote } = await import("../db/tags.js");
		await createNote(note);
		await createTag(tag);
		await addTagToNote({ note_id: note.id, tag_id: tag.id });

		const res = await app.request(`/notes/${note.id}/tags/${tag.id}`, {
			method: "DELETE",
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.message).toBe("Tag removed from note");
	});

	test("DELETE /tags/:id - タグを削除できる", async () => {
		const tag = createTestTag({ name: "test-tag" });

		const { createTag } = await import("../db/tags.js");
		await createTag(tag);

		const res = await app.request(`/tags/${tag.id}`, {
			method: "DELETE",
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.message).toBe("Tag deleted");
	});
});

