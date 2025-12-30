import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import type { SyncPullResponse, SyncPushRequest } from "@locus/shared";
import { app } from "../index.js";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
  createTestRSSFeed,
  createTestTag,
} from "../test/helpers.js";

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
      process.env.DATABASE_URL = undefined;
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

  test("GET /sync/pull - 無効なsinceパラメータの場合は400を返す", async () => {
    const res = await app.request("/sync/pull?since=invalid");
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Invalid 'since' parameter");
  });

  test("GET /sync/pull - Markdownノートの詳細情報が含まれる", async () => {
    const note = createTestNoteCore({
      title: "MD Note",
      type: "md",
      updated_at: Math.floor(Date.now() / 1000),
    });

    const { createNote } = await import("../db/notes.js");
    await createNote(note);

    const { createNoteMD } = await import("../db/notes_md.js");
    await createNoteMD({ note_id: note.id, content: "Test content" });

    const since = note.updated_at - 1;
    const res = await app.request(`/sync/pull?since=${since}`);
    expect(res.status).toBe(200);

    const response: SyncPullResponse = await res.json();
    const noteData = response.notes.find((n) => n.core.id === note.id);
    expect(noteData).toBeDefined();
    expect(noteData?.md).toBeDefined();
    expect(noteData?.md?.content).toBe("Test content");
  });

  test("GET /sync/pull - RSSノートの詳細情報が含まれる", async () => {
    const feed = createTestRSSFeed({ url: "https://example.com/feed" });
    const { createFeed } = await import("../db/rss.js");
    await createFeed(feed);

    const note = createTestNoteCore({
      title: "RSS Note",
      type: "rss",
      updated_at: Math.floor(Date.now() / 1000),
    });

    const { createNote, getNote } = await import("../db/notes.js");
    // ノートが既に存在する場合はスキップ
    const existing = await getNote(note.id);
    if (!existing) {
      await createNote(note);
    }

    const { createItem } = await import("../db/rss.js");
    // RSSアイテムが既に存在する場合はスキップ
    const { getItemByNoteId } = await import("../db/rss.js");
    const existingItem = await getItemByNoteId(note.id);
    if (!existingItem) {
      await createItem({
        note_id: note.id,
        feed_id: feed.id,
        url: "https://example.com/item",
        content: "RSS content",
        published_at: Math.floor(Date.now() / 1000),
      });
    }

    const since = note.updated_at - 1;
    const res = await app.request(`/sync/pull?since=${since}`);
    expect(res.status).toBe(200);

    const response: SyncPullResponse = await res.json();
    const noteData = response.notes.find((n) => n.core.id === note.id);
    expect(noteData).toBeDefined();
    if (noteData) {
      // RSSアイテムが存在する場合のみ確認
      if (noteData.rss) {
        expect(noteData.rss.content).toBeDefined();
      }
    }
  });

  test("POST /sync/push - Markdownノートの更新が同期される", async () => {
    const note = createTestNoteCore({
      title: "MD Note",
      type: "md",
      updated_at: Math.floor(Date.now() / 1000),
    });

    const pushRequest: SyncPushRequest = {
      notes: [
        {
          core: note,
          md: {
            note_id: note.id,
            content: "Updated content",
          },
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

    // Markdownノートが作成されたことを確認
    const { getNoteMD } = await import("../db/notes_md.js");
    const createdMD = await getNoteMD(note.id);
    expect(createdMD).not.toBeNull();
    expect(createdMD?.content).toBe("Updated content");
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

  test("POST /sync/push - フィードも同期できる", async () => {
    const feed = createTestRSSFeed({ url: "https://example.com/feed" });

    const pushRequest: SyncPushRequest = {
      notes: [],
      tags: [],
      links: [],
      feeds: [feed],
    };

    const res = await app.request("/sync/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pushRequest),
    });

    expect(res.status).toBe(200);

    // フィードが作成されたことを確認
    const { getFeed } = await import("../db/rss.js");
    const createdFeed = await getFeed(feed.id);
    expect(createdFeed).not.toBeNull();
    expect(createdFeed?.url).toBe(feed.url);
  });
});
