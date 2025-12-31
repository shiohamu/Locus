import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import * as rssDb from "../db/rss.js";
import * as tagsDb from "../db/tags.js";
import * as webClipsDb from "../db/web-clips.js";
import { app } from "../index.js";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
  createTestRSSFeed,
  createTestRSSItem,
  createTestTag,
  createTestWebClip,
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

  test("GET /public/notes/:id - RSSノートの詳細を取得できる", async () => {
    const feed = createTestRSSFeed();
    await rssDb.createFeed(feed);

    const note = createTestNoteCore({
      title: "RSS Note",
      type: "rss",
      public: 1,
    });
    await notesDb.createNote(note);

    const rssItem = createTestRSSItem({
      note_id: note.id,
      feed_id: feed.id,
      url: "https://example.com/article",
      content: "RSS content",
      published_at: Math.floor(Date.now() / 1000),
    });
    await rssDb.createItem(rssItem);

    const res = await app.request(`/public/notes/${note.id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.note.id).toBe(note.id);
    expect(body.content).toBe("RSS content");
    expect(body.metadata.url).toBe("https://example.com/article");
    expect(body.metadata.published_at).toBeDefined();
  });

  test("GET /public/notes/:id - WebClipノートの詳細を取得できる", async () => {
    const note = createTestNoteCore({
      title: "WebClip Note",
      type: "web_clip",
      public: 1,
    });
    await notesDb.createNote(note);

    const webClip = createTestWebClip({
      note_id: note.id,
      source_url: "https://example.com/article",
      content: "WebClip content",
      fetched_at: Math.floor(Date.now() / 1000),
    });
    await webClipsDb.createWebClip(webClip);

    const res = await app.request(`/public/notes/${note.id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.note.id).toBe(note.id);
    expect(body.content).toBe("WebClip content");
    expect(body.metadata.source_url).toBe("https://example.com/article");
    expect(body.metadata.fetched_at).toBeDefined();
  });

  test("GET /public/notes/:id - 公開ノート間のリンクのみが含まれる", async () => {
    const publicNote1 = createTestNoteCore({
      title: "Public Note 1",
      type: "md",
      public: 1,
    });
    const publicNote2 = createTestNoteCore({
      title: "Public Note 2",
      type: "md",
      public: 1,
    });
    const privateNote = createTestNoteCore({
      title: "Private Note",
      type: "md",
      public: 0,
    });

    await notesDb.createNote(publicNote1);
    await notesDb.createNote(publicNote2);
    await notesDb.createNote(privateNote);

    // 公開ノート間のリンク
    await linksDb.createLink({
      from_note_id: publicNote1.id,
      to_note_id: publicNote2.id,
    });

    // 公開ノートから非公開ノートへのリンク
    await linksDb.createLink({
      from_note_id: publicNote1.id,
      to_note_id: privateNote.id,
    });

    const res = await app.request(`/public/notes/${publicNote1.id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.links.outgoing)).toBe(true);
    expect(Array.isArray(body.links.incoming)).toBe(true);
    // 公開ノート間のリンクのみが含まれる
    const outgoingPublicLinks = body.links.outgoing.filter(
      (link: { to_note_id: string }) => link.to_note_id === publicNote2.id
    );
    expect(outgoingPublicLinks.length).toBe(1);
    // 非公開ノートへのリンクは含まれない
    const outgoingPrivateLinks = body.links.outgoing.filter(
      (link: { to_note_id: string }) => link.to_note_id === privateNote.id
    );
    expect(outgoingPrivateLinks.length).toBe(0);
  });

  test("GET /public/notes - エラー時に500を返す", async () => {
    // データベース接続を無効にしてエラーを発生させる
    const originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "file:/invalid/path.db";

    const res = await app.request("/public/notes");
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Failed to fetch public notes");

    process.env.DATABASE_URL = originalEnv;
  });
});
