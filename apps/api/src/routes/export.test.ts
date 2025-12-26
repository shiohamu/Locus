import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import JSZip from "jszip";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import { cleanupTestDbFile, createTestDbFile, createTestNoteCore } from "../test/helpers.js";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";

describe("export API", () => {
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

  test("GET /export/markdown - Markdownエクスポートが機能する", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "md" });
    await notesDb.createNote(note);
    await notesMDDb.createNoteMD({ note_id: note.id, content: "Test content" });

    const res = await app.request("/export/markdown");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/zip");
    expect(res.headers.get("Content-Disposition")).toContain("locus-export.zip");

    const zipBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    expect(Object.keys(zip.files).length).toBe(1);
    const file = zip.files[`${note.id}.md`];
    expect(file).toBeDefined();

    const content = await file.async("string");
    expect(content).toContain("Test Note");
    expect(content).toContain("Test content");
  });

  test("GET /export/markdown?type=md - タイプでフィルタリングできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "rss" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });

    const res = await app.request("/export/markdown?type=md");
    expect(res.status).toBe(200);

    const zipBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    expect(Object.keys(zip.files).length).toBe(1);
    expect(zip.files[`${note1.id}.md`]).toBeDefined();
  });

  test("GET /export/json - JSONエクスポートが機能する", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "md" });
    await notesDb.createNote(note);
    await notesMDDb.createNoteMD({ note_id: note.id, content: "Test content" });

    const res = await app.request("/export/json");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toContain("locus-export.json");

    const jsonString = await res.text();
    const data = JSON.parse(jsonString);

    expect(data.version).toBe("1.0");
    expect(data.exported_at).toBeGreaterThan(0);
    expect(data.notes.length).toBe(1);
    expect(data.notes[0].title).toBe("Test Note");
    expect(data.notes_md.length).toBe(1);
    expect(data.notes_md[0].content).toBe("Test content");
  });

  test("GET /export/json - 全データがエクスポートされる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });
    await notesMDDb.createNoteMD({ note_id: note2.id, content: "Content 2" });

    const res = await app.request("/export/json");
    expect(res.status).toBe(200);

    const jsonString = await res.text();
    const data = JSON.parse(jsonString);

    expect(data.notes.length).toBe(2);
    expect(data.notes_md.length).toBe(2);
    expect(data.tags).toEqual([]);
    expect(data.links).toEqual([]);
    expect(data.rss_feeds).toEqual([]);
    expect(data.rss_items).toEqual([]);
    expect(data.web_clips).toEqual([]);
    expect(data.files).toEqual([]);
  });
});

