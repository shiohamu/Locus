import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import {
  cleanupTestDbFile,
  createTestDbFile,
  createTestFile,
  createTestNoteCore,
} from "../test/helpers.js";
import * as filesDb from "./files.js";
import * as notesDb from "./notes.js";

describe("files", () => {
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

  test("createFile - ファイルを作成できる", async () => {
    const file = createTestFile();

    const created = await filesDb.createFile(file);
    expect(created.id).toBe(file.id);
    expect(created.filename).toBe(file.filename);
    expect(created.mime_type).toBe(file.mime_type);
  });

  test("getFile - ファイルを取得できる", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    const retrieved = await filesDb.getFile(file.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(file.id);
    expect(retrieved?.filename).toBe(file.filename);
  });

  test("getFile - 存在しないファイルはnullを返す", async () => {
    const retrieved = await filesDb.getFile("non-existent-id");
    expect(retrieved).toBeNull();
  });

  test("listFiles - ファイル一覧を取得できる", async () => {
    const file1 = createTestFile({ filename: "file1.pdf" });
    const file2 = createTestFile({ filename: "file2.pdf" });
    await filesDb.createFile(file1);
    await filesDb.createFile(file2);

    const files = await filesDb.listFiles();
    expect(files.length).toBe(2);
  });

  test("listFiles - limitとoffsetが機能する", async () => {
    for (let i = 0; i < 5; i++) {
      const file = createTestFile({ filename: `file${i}.pdf` });
      await filesDb.createFile(file);
    }

    const files = await filesDb.listFiles({ limit: 2, offset: 1 });
    expect(files.length).toBe(2);
  });

  test("deleteFile - ファイルを削除できる", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    await filesDb.deleteFile(file.id);

    const retrieved = await filesDb.getFile(file.id);
    expect(retrieved).toBeNull();
  });

  test("linkFileToNote - ノートとファイルを関連付けできる", async () => {
    const note = createTestNoteCore({ title: "Test Note" });
    await notesDb.createNote(note);

    const file = createTestFile();
    await filesDb.createFile(file);

    const fileNote = await filesDb.linkFileToNote(file.id, note.id);
    expect(fileNote.file_id).toBe(file.id);
    expect(fileNote.note_id).toBe(note.id);
  });

  test("unlinkFileFromNote - ノートとファイルの関連を解除できる", async () => {
    const note = createTestNoteCore({ title: "Test Note" });
    await notesDb.createNote(note);

    const file = createTestFile();
    await filesDb.createFile(file);

    await filesDb.linkFileToNote(file.id, note.id);

    await filesDb.unlinkFileFromNote(file.id, note.id);

    const files = await filesDb.getFilesByNote(note.id);
    expect(files.length).toBe(0);
  });

  test("getFilesByNote - ノートに紐づくファイル一覧を取得できる", async () => {
    const note = createTestNoteCore({ title: "Test Note" });
    await notesDb.createNote(note);

    const file1 = createTestFile({ filename: "file1.pdf" });
    const file2 = createTestFile({ filename: "file2.pdf" });
    await filesDb.createFile(file1);
    await filesDb.createFile(file2);

    await filesDb.linkFileToNote(file1.id, note.id);
    await filesDb.linkFileToNote(file2.id, note.id);

    const files = await filesDb.getFilesByNote(note.id);
    expect(files.length).toBe(2);
    expect(files.map((f) => f.id)).toContain(file1.id);
    expect(files.map((f) => f.id)).toContain(file2.id);
  });

  test("getNoteIdsByFile - ファイルに紐づくノートID一覧を取得できる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1" });
    const note2 = createTestNoteCore({ title: "Note 2" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    const file = createTestFile();
    await filesDb.createFile(file);

    await filesDb.linkFileToNote(file.id, note1.id);
    await filesDb.linkFileToNote(file.id, note2.id);

    const noteIds = await filesDb.getNoteIdsByFile(file.id);
    expect(noteIds.length).toBe(2);
    expect(noteIds).toContain(note1.id);
    expect(noteIds).toContain(note2.id);
  });
});
