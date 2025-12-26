import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import { cleanupTestDbFile, createTestDbFile, createTestNoteCore } from "../test/helpers.js";

describe("search API", () => {
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

  test("GET /search?q=query - 全文検索が機能する", async () => {
    const note1 = createTestNoteCore({ title: "JavaScript Tutorial", type: "md" });
    const note2 = createTestNoteCore({ title: "Python Guide", type: "md" });

    const { createNote } = await import("../db/notes.js");
    const { updateFTS } = await import("../db/search.js");
    await createNote(note1);
    await createNote(note2);

    await updateFTS(note1.id, "JavaScript Tutorial", "Learn JavaScript programming");
    await updateFTS(note2.id, "Python Guide", "Learn Python programming");

    const res = await app.request("/search?q=JavaScript");
    expect(res.status).toBe(200);

    const notes = await res.json();
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBe(1);
    expect(notes[0].id).toBe(note1.id);
    expect(notes[0].title).toBe("JavaScript Tutorial");
  });

  test("GET /search?q=query - クエリパラメータがない場合は400を返す", async () => {
    const res = await app.request("/search");
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Query parameter 'q' is required");
  });

  test("GET /search?q=query&limit=1 - limitパラメータが機能する", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });

    const { createNote } = await import("../db/notes.js");
    const { updateFTS } = await import("../db/search.js");
    await createNote(note1);
    await createNote(note2);

    await updateFTS(note1.id, "Note 1", "Content 1");
    await updateFTS(note2.id, "Note 2", "Content 2");

    const res = await app.request("/search?q=Note&limit=1");
    expect(res.status).toBe(200);

    const notes = await res.json();
    expect(notes.length).toBe(1);
  });

  test("GET /search?q=query&offset=1 - offsetパラメータが機能する", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });

    const { createNote } = await import("../db/notes.js");
    const { updateFTS } = await import("../db/search.js");
    await createNote(note1);
    await createNote(note2);

    await updateFTS(note1.id, "Note 1", "Content 1");
    await updateFTS(note2.id, "Note 2", "Content 2");

    const res = await app.request("/search?q=Note&limit=1&offset=1");
    expect(res.status).toBe(200);

    const notes = await res.json();
    expect(notes.length).toBe(1);
  });
});
