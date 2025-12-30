import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestNoteCore,
} from "../test/helpers.js";

describe("links API", () => {
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

  test("GET /notes/:id/links - ノートのリンクを取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });
    const note3 = createTestNoteCore({ title: "Note 3" });

    const { createNote } = await import("../db/notes.js");
    const { createLink } = await import("../db/links.js");

    await createNote(note1);
    await createNote(note2);
    await createNote(note3);

    // note1 -> note2
    await createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });

    // note3 -> note2
    await createLink({
      from_note_id: note3.id,
      to_note_id: note2.id,
    });

    const res = await app.request(`/notes/${note2.id}/links`);
    expect(res.status).toBe(200);

    const links = await res.json();
    expect(links).toHaveProperty("incoming");
    expect(links).toHaveProperty("outgoing");
    expect(Array.isArray(links.incoming)).toBe(true);
    expect(Array.isArray(links.outgoing)).toBe(true);
    expect(links.incoming.length).toBe(2);
    expect(links.incoming.map((l: { from_note_id: string }) => l.from_note_id)).toContain(
      note1.id
    );
    expect(links.incoming.map((l: { from_note_id: string }) => l.from_note_id)).toContain(
      note3.id
    );
  });

  test("GET /notes/:id/links - 存在しないノートの場合は空のリンクを返す", async () => {
    const nonExistentId = crypto.randomUUID();

    const res = await app.request(`/notes/${nonExistentId}/links`);
    expect(res.status).toBe(200);

    const links = await res.json();
    expect(links).toHaveProperty("incoming");
    expect(links).toHaveProperty("outgoing");
    expect(links.incoming.length).toBe(0);
    expect(links.outgoing.length).toBe(0);
  });
});

