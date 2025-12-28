import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { Client } from "@libsql/client";
import * as notesDb from "../db/notes.js";
import * as webClipsDb from "../db/web-clips.js";
import { app } from "../index.js";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
  createTestWebClip,
} from "../test/helpers.js";

// fetchをモック
const mockFetch = spyOn(global, "fetch").mockImplementation(async () => {
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
</head>
<body>
  <article>
    <h1>Test Article</h1>
    <p>This is a test article content.</p>
  </article>
</body>
</html>`,
    {
      headers: { "content-type": "text/html" },
    }
  );
});

describe("web-clips API", () => {
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
    mockFetch.mockClear();
  });

  test("POST /web-clips - Webクリップを作成できる", async () => {
    const res = await app.request("/web-clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/article" }),
    });

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.note).toBeDefined();
    expect(body.note.type).toBe("web_clip");
    expect(body.webClip).toBeDefined();
    expect(body.webClip.source_url).toBe("https://example.com/article");
  });

  test("POST /web-clips - URLが必須", async () => {
    const res = await app.request("/web-clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("URL is required");
  });

  test("GET /web-clips - Webクリップ一覧を取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "web_clip" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "web_clip" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    const webClip1 = createTestWebClip({ note_id: note1.id });
    const webClip2 = createTestWebClip({ note_id: note2.id });
    await webClipsDb.createWebClip(webClip1);
    await webClipsDb.createWebClip(webClip2);

    const res = await app.request("/web-clips");
    expect(res.status).toBe(200);

    const webClips = await res.json();
    expect(Array.isArray(webClips)).toBe(true);
    expect(webClips.length).toBe(2);
  });

  test("GET /web-clips/:id - Webクリップを取得できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });
    await webClipsDb.createWebClip(webClip);

    const res = await app.request(`/web-clips/${note.id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.note_id).toBe(note.id);
    expect(body.source_url).toBe(webClip.source_url);
  });

  test("GET /web-clips/:id - 存在しないWebクリップは404を返す", async () => {
    const res = await app.request("/web-clips/non-existent-id");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Web clip not found");
  });

  test("PUT /web-clips/:id - Webクリップを更新（再取得）できる", async () => {
    // 最初のWebクリップを作成
    const createRes = await app.request("/web-clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/article" }),
    });

    const created = await createRes.json();
    const noteId = created.note.id;

    // 再取得
    const res = await app.request(`/web-clips/${noteId}`, {
      method: "PUT",
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.note.id).toBe(noteId);
    expect(body.webClip).toBeDefined();
  });

  test("DELETE /web-clips/:id - Webクリップを削除できる", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "web_clip" });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({ note_id: note.id });
    await webClipsDb.createWebClip(webClip);

    const res = await app.request(`/web-clips/${note.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("Web clip deleted");

    // 削除後は取得できない
    const getRes = await app.request(`/web-clips/${note.id}`);
    expect(getRes.status).toBe(404);
  });
});
