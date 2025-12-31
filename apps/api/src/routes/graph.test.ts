import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
  createTestTag,
} from "../test/helpers.js";

describe("graph API", () => {
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

  test("GET /graph - グラフデータを取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });

    const { createNote } = await import("../db/notes.js");
    const { createLink } = await import("../db/links.js");

    await createNote(note1);
    await createNote(note2);

    await createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });

    const res = await app.request("/graph");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    expect(graphData).toHaveProperty("nodes");
    expect(graphData).toHaveProperty("edges");
    expect(Array.isArray(graphData.nodes)).toBe(true);
    expect(Array.isArray(graphData.edges)).toBe(true);
    expect(graphData.nodes.length).toBeGreaterThanOrEqual(2);
    expect(graphData.edges.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /graph?type=md - タイプでフィルタリングできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "rss" });

    const { createNote } = await import("../db/notes.js");

    await createNote(note1);
    await createNote(note2);

    const res = await app.request("/graph?type=md");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    expect(graphData.nodes.length).toBe(1);
    expect(graphData.nodes[0].id).toBe(note1.id);
    expect(graphData.nodes[0].type).toBe("md");
  });

  test("GET /graph?tags=tag1 - タグでフィルタリングできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    const tag1 = createTestTag({ name: "tag1" });

    const { createNote } = await import("../db/notes.js");
    const { createTag, addTagToNote } = await import("../db/tags.js");

    await createNote(note1);
    await createNote(note2);
    await createTag(tag1);
    await addTagToNote({ note_id: note1.id, tag_id: tag1.id });

    const res = await app.request("/graph?tags=tag1");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    expect(graphData.nodes.length).toBe(1);
    expect(graphData.nodes[0].id).toBe(note1.id);
    expect(graphData.nodes[0].tags).toContain("tag1");
  });

  test("GET /graph?tags=tag1,tag2 - 複数のタグでフィルタリングできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    const tag1 = createTestTag({ name: "tag1" });
    const tag2 = createTestTag({ name: "tag2" });

    const { createNote } = await import("../db/notes.js");
    const { createTag, addTagToNote } = await import("../db/tags.js");

    await createNote(note1);
    await createNote(note2);
    await createTag(tag1);
    await createTag(tag2);
    await addTagToNote({ note_id: note1.id, tag_id: tag1.id });
    await addTagToNote({ note_id: note1.id, tag_id: tag2.id });

    const res = await app.request("/graph?tags=tag1,tag2");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    expect(graphData.nodes.length).toBe(1);
    expect(graphData.nodes[0].id).toBe(note1.id);
  });

  test("GET /graph?limit=1 - limitパラメータが機能する", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });

    const { createNote } = await import("../db/notes.js");

    await createNote(note1);
    await createNote(note2);

    const res = await app.request("/graph?limit=1");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    expect(graphData.nodes.length).toBeLessThanOrEqual(1);
  });

  test("GET /graph - エッジが正しく生成される", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    const note3 = createTestNoteCore({ title: "Note 3", type: "md" });

    const { createNote } = await import("../db/notes.js");
    const { createLink } = await import("../db/links.js");

    await createNote(note1);
    await createNote(note2);
    await createNote(note3);

    await createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });
    await createLink({
      from_note_id: note2.id,
      to_note_id: note3.id,
    });

    const res = await app.request("/graph");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    const edges = graphData.edges;
    expect(edges.length).toBeGreaterThanOrEqual(2);

    // エッジが正しく生成されているか確認
    const edge1 = edges.find(
      (e: { from: string; to: string }) => e.from === note1.id && e.to === note2.id
    );
    const edge2 = edges.find(
      (e: { from: string; to: string }) => e.from === note2.id && e.to === note3.id
    );
    expect(edge1).toBeDefined();
    expect(edge2).toBeDefined();
  });

  test("GET /graph - タグ情報がノードに含まれる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const tag1 = createTestTag({ name: "tag1" });

    const { createNote } = await import("../db/notes.js");
    const { createTag, addTagToNote } = await import("../db/tags.js");

    await createNote(note1);
    await createTag(tag1);
    await addTagToNote({ note_id: note1.id, tag_id: tag1.id });

    const res = await app.request("/graph");
    expect(res.status).toBe(200);

    const graphData = await res.json();
    const node = graphData.nodes.find((n: { id: string }) => n.id === note1.id);
    expect(node).toBeDefined();
    expect(node.tags).toContain("tag1");
  });

  test("GET /graph - エラーが発生した場合は500を返す", async () => {
    // 無効なデータベース接続をシミュレート
    const originalDb = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "file:/invalid/path.db";

    const res = await app.request("/graph");
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body).toHaveProperty("error");

    // 元に戻す
    process.env.DATABASE_URL = originalDb;
  });
});
