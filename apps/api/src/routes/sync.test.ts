import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore, createTestTag, createTestRSSFeed } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import type { SyncPullResponse, SyncPushRequest } from "@locus/shared";

describe("sync API", () => {
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

	test("GET /sync/pull - サーバーから差分を取得できる", async () => {
		const note1 = createTestNoteCore({
			title: "Note 1",
			type: "md",
			updated_at: Math.floor(Date.now() / 1000),
		});
		const note2 = createTestNoteCore({
			title: "Note 2",
			type: "md",
			updated_at: Math.floor(Date.now() / 1000) + 1,
		});

		const { createNote } = await import("../db/notes.js");
		await createNote(note1);
		await createNote(note2);

		const since = note1.updated_at - 1;
		const res = await app.request(`/sync/pull?since=${since}`);
		expect(res.status).toBe(200);

		const response: SyncPullResponse = await res.json();
		expect(response.notes.length).toBe(2);
		expect(response.notes.some((n) => n.core.id === note1.id)).toBe(true);
		expect(response.notes.some((n) => n.core.id === note2.id)).toBe(true);
	});

	test("GET /sync/pull - sinceパラメータがない場合は400を返す", async () => {
		const res = await app.request("/sync/pull");
		expect(res.status).toBe(400);

		const body = await res.json();
		expect(body.error).toBe("Query parameter 'since' is required");
	});

	test("GET /sync/pull - sinceより新しいノートのみを返す", async () => {
		const now = Math.floor(Date.now() / 1000);
		const note1 = createTestNoteCore({
			title: "Old Note",
			type: "md",
			updated_at: now - 100,
		});
		const note2 = createTestNoteCore({
			title: "New Note",
			type: "md",
			updated_at: now,
		});

		const { createNote } = await import("../db/notes.js");
		await createNote(note1);
		await createNote(note2);

		const since = now - 50; // note1より新しく、note2より古い
		const res = await app.request(`/sync/pull?since=${since}`);
		expect(res.status).toBe(200);

		const response: SyncPullResponse = await res.json();
		expect(response.notes.length).toBe(1);
		expect(response.notes[0].core.id).toBe(note2.id);
	});

	test("POST /sync/push - クライアントから差分を送信できる", async () => {
		const note = createTestNoteCore({
			title: "New Note",
			type: "md",
			updated_at: Math.floor(Date.now() / 1000),
		});

		const pushRequest: SyncPushRequest = {
			notes: [
				{
					core: note,
				},
			],
			tags: [],
			links: [],
			feeds: [],
		};

		const res = await app.request("/sync/push", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(pushRequest),
		});

		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.message).toBe("Sync completed");

		// ノートが作成されたことを確認
		const { getNote } = await import("../db/notes.js");
		const created = await getNote(note.id);
		expect(created).not.toBeNull();
		expect(created?.title).toBe(note.title);
	});

	test("POST /sync/push - 最終更新優先（LWW）でマージされる", async () => {
		const now = Math.floor(Date.now() / 1000);
		const note1 = createTestNoteCore({
			title: "Original Title",
			type: "md",
			updated_at: now - 100,
		});

		const { createNote } = await import("../db/notes.js");
		await createNote(note1);

		// より新しいタイムスタンプで更新を送信
		const updatedNote = {
			...note1,
			title: "Updated Title",
			updated_at: now,
		};

		const pushRequest: SyncPushRequest = {
			notes: [
				{
					core: updatedNote,
				},
			],
			tags: [],
			links: [],
			feeds: [],
		};

		const res = await app.request("/sync/push", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(pushRequest),
		});

		expect(res.status).toBe(200);

		// ノートが更新されたことを確認
		const { getNote } = await import("../db/notes.js");
		const retrieved = await getNote(note1.id);
		expect(retrieved?.title).toBe("Updated Title");
	});

	test("POST /sync/push - 古い更新は無視される", async () => {
		const now = Math.floor(Date.now() / 1000);
		const note1 = createTestNoteCore({
			title: "New Title",
			type: "md",
			updated_at: now,
		});

		const { createNote } = await import("../db/notes.js");
		await createNote(note1);

		// より古いタイムスタンプで更新を送信
		const oldNote = {
			...note1,
			title: "Old Title",
			updated_at: now - 100,
		};

		const pushRequest: SyncPushRequest = {
			notes: [
				{
					core: oldNote,
				},
			],
			tags: [],
			links: [],
			feeds: [],
		};

		const res = await app.request("/sync/push", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(pushRequest),
		});

		expect(res.status).toBe(200);

		// ノートが更新されていないことを確認
		const { getNote } = await import("../db/notes.js");
		const retrieved = await getNote(note1.id);
		expect(retrieved?.title).toBe("New Title"); // 古い更新は無視される
	});

	test("POST /sync/push - タグとリンクも同期できる", async () => {
		const note = createTestNoteCore({
			title: "Test Note",
			type: "md",
		});
		const tag = createTestTag({ name: "test-tag" });

		const pushRequest: SyncPushRequest = {
			notes: [
				{
					core: note,
				},
			],
			tags: [tag],
			links: [],
			feeds: [],
		};

		const res = await app.request("/sync/push", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(pushRequest),
		});

		expect(res.status).toBe(200);

		// タグが作成されたことを確認
		const { getTag } = await import("../db/tags.js");
		const createdTag = await getTag(tag.id);
		expect(createdTag).not.toBeNull();
		expect(createdTag?.name).toBe(tag.name);
	});
});

