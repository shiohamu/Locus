import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
  createTestWebClip,
} from "../test/helpers.js";
import * as notesDb from "./notes.js";
import * as webClipsDb from "./web-clips.js";

describe("web-clips", () => {
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

  test("createWebClip - Webクリップを作成できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });

    const created = await webClipsDb.createWebClip(webClip);
    expect(created.note_id).toBe(webClip.note_id);
    expect(created.source_url).toBe(webClip.source_url);
    expect(created.content).toBe(webClip.content);
  });

  test("getWebClip - Webクリップを取得できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });
    await webClipsDb.createWebClip(webClip);

    const retrieved = await webClipsDb.getWebClip(note.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.note_id).toBe(webClip.note_id);
    expect(retrieved?.source_url).toBe(webClip.source_url);
  });

  test("getWebClip - 存在しないWebクリップはnullを返す", async () => {
    const retrieved = await webClipsDb.getWebClip("non-existent-id");
    expect(retrieved).toBeNull();
  });

  test("updateWebClip - Webクリップを更新できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });
    await webClipsDb.createWebClip(webClip);

    const updated = {
      ...webClip,
      content: "Updated content",
      fetched_at: Math.floor(Date.now() / 1000),
    };

    const result = await webClipsDb.updateWebClip(updated);
    expect(result.content).toBe("Updated content");

    const retrieved = await webClipsDb.getWebClip(note.id);
    expect(retrieved?.content).toBe("Updated content");
  });

  test("listWebClips - Webクリップ一覧を取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "web_clip" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "web_clip" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    const webClip1 = createTestWebClip({ note_id: note1.id });
    const webClip2 = createTestWebClip({ note_id: note2.id });
    await webClipsDb.createWebClip(webClip1);
    await webClipsDb.createWebClip(webClip2);

    const webClips = await webClipsDb.listWebClips();
    expect(webClips.length).toBe(2);
  });

  test("listWebClips - limitとoffsetが機能する", async () => {
    const notes = [];
    for (let i = 0; i < 5; i++) {
      const note = createTestNoteCore({ title: `Note ${i}`, type: "web_clip" });
      await notesDb.createNote(note);
      notes.push(note);
    }

    for (const note of notes) {
      const webClip = createTestWebClip({ note_id: note.id });
      await webClipsDb.createWebClip(webClip);
    }

    const webClips = await webClipsDb.listWebClips({ limit: 2, offset: 1 });
    expect(webClips.length).toBe(2);
  });

  test("deleteWebClip - Webクリップを削除できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });
    await webClipsDb.createWebClip(webClip);

    await webClipsDb.deleteWebClip(note.id);

    const retrieved = await webClipsDb.getWebClip(note.id);
    expect(retrieved).toBeNull();
  });
});
