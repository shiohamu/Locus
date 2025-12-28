import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { cleanupTestDbFile, createTestDbFile, createTestNoteCore } from "../test/helpers.js";
import * as linksDb from "./links.js";
import * as notesDb from "./notes.js";

describe("links", () => {
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

  test("createLink - リンクを作成できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });

    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    const link = {
      from_note_id: note1.id,
      to_note_id: note2.id,
    };

    const created = await linksDb.createLink(link);
    expect(created).toEqual(link);
  });

  test("getLinksByNote - 双方向リンクを取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });
    const note3 = createTestNoteCore({ title: "Note 3" });

    await notesDb.createNote(note1);
    await notesDb.createNote(note2);
    await notesDb.createNote(note3);

    // note1 -> note2
    await linksDb.createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });

    // note3 -> note2
    await linksDb.createLink({
      from_note_id: note3.id,
      to_note_id: note2.id,
    });

    const links = await linksDb.getLinksByNote(note2.id);

    // note2に入るリンク（incoming）
    expect(links.incoming.length).toBe(2);
    expect(links.incoming.map((l) => l.from_note_id)).toContain(note1.id);
    expect(links.incoming.map((l) => l.from_note_id)).toContain(note3.id);

    // note2から出るリンク（outgoing）
    expect(links.outgoing.length).toBe(0);
  });

  test("getLinksByNote - 出るリンクも取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });

    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await linksDb.createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });

    const links = await linksDb.getLinksByNote(note1.id);

    expect(links.outgoing.length).toBe(1);
    expect(links.outgoing[0].to_note_id).toBe(note2.id);
    expect(links.incoming.length).toBe(0);
  });

  test("deleteLink - リンクを削除できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });

    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await linksDb.createLink({
      from_note_id: note1.id,
      to_note_id: note2.id,
    });

    let links = await linksDb.getLinksByNote(note1.id);
    expect(links.outgoing.length).toBe(1);

    await linksDb.deleteLink(note1.id, note2.id);

    links = await linksDb.getLinksByNote(note1.id);
    expect(links.outgoing.length).toBe(0);
  });
});
