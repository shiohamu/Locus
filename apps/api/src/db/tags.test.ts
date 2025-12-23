import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { createTestDbFile, cleanupTestDbFile, createTestNoteCore, createTestTag } from "../test/helpers.js";
import type { Client } from "@libsql/client";
import * as tagsDb from "./tags.js";
import * as notesDb from "./notes.js";

describe("tags", () => {
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

	test("createTag - タグを作成できる", async () => {
		const tag = createTestTag({
			name: "test-tag",
		});

		const created = await tagsDb.createTag(tag);
		expect(created).toEqual(tag);
	});

	test("getTag - タグを取得できる", async () => {
		const tag = createTestTag({
			name: "test-tag",
		});

		await tagsDb.createTag(tag);
		const retrieved = await tagsDb.getTag(tag.id);

		expect(retrieved).not.toBeNull();
		expect(retrieved?.id).toBe(tag.id);
		expect(retrieved?.name).toBe(tag.name);
	});

	test("getTagByName - タグ名でタグを取得できる", async () => {
		const tag = createTestTag({
			name: "test-tag",
		});

		await tagsDb.createTag(tag);
		const retrieved = await tagsDb.getTagByName("test-tag");

		expect(retrieved).not.toBeNull();
		expect(retrieved?.id).toBe(tag.id);
		expect(retrieved?.name).toBe("test-tag");
	});

	test("listTags - タグ一覧を取得できる", async () => {
		const tag1 = createTestTag({ name: "tag1" });
		const tag2 = createTestTag({ name: "tag2" });

		await tagsDb.createTag(tag1);
		await tagsDb.createTag(tag2);

		const tags = await tagsDb.listTags();
		expect(tags.length).toBe(2);
		expect(tags.map((t) => t.name)).toContain("tag1");
		expect(tags.map((t) => t.name)).toContain("tag2");
	});

	test("addTagToNote - ノートにタグを追加できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag = createTestTag({ name: "test-tag" });

		await notesDb.createNote(note);
		await tagsDb.createTag(tag);
		await tagsDb.addTagToNote({ note_id: note.id, tag_id: tag.id });

		const tags = await tagsDb.getTagsByNote(note.id);
		expect(tags.length).toBe(1);
		expect(tags[0].id).toBe(tag.id);
	});

	test("removeTagFromNote - ノートからタグを削除できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag = createTestTag({ name: "test-tag" });

		await notesDb.createNote(note);
		await tagsDb.createTag(tag);
		await tagsDb.addTagToNote({ note_id: note.id, tag_id: tag.id });

		let tags = await tagsDb.getTagsByNote(note.id);
		expect(tags.length).toBe(1);

		await tagsDb.removeTagFromNote(note.id, tag.id);

		tags = await tagsDb.getTagsByNote(note.id);
		expect(tags.length).toBe(0);
	});

	test("getTagsByNote - ノートに紐づくタグ一覧を取得できる", async () => {
		const note = createTestNoteCore({ title: "Test Note" });
		const tag1 = createTestTag({ name: "tag1" });
		const tag2 = createTestTag({ name: "tag2" });

		await notesDb.createNote(note);
		await tagsDb.createTag(tag1);
		await tagsDb.createTag(tag2);
		await tagsDb.addTagToNote({ note_id: note.id, tag_id: tag1.id });
		await tagsDb.addTagToNote({ note_id: note.id, tag_id: tag2.id });

		const tags = await tagsDb.getTagsByNote(note.id);
		expect(tags.length).toBe(2);
		expect(tags.map((t) => t.id)).toContain(tag1.id);
		expect(tags.map((t) => t.id)).toContain(tag2.id);
	});

	test("deleteTag - タグを削除できる", async () => {
		const tag = createTestTag({ name: "test-tag" });

		await tagsDb.createTag(tag);
		await tagsDb.deleteTag(tag.id);

		const retrieved = await tagsDb.getTag(tag.id);
		expect(retrieved).toBeNull();
	});
});

