import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { Client } from "@libsql/client";
import { app } from "../index.js";
import { cleanupTestDbFile, createTestDbFile, createTestFile, createTestNoteCore } from "../test/helpers.js";
import * as filesDb from "../db/files.js";
import * as notesDb from "../db/notes.js";

describe("files API", () => {
  let testDb: Client;
  let dbPath: string;
  let originalEnv: string | undefined;
  let originalFilesDir: string | undefined;
  let testFilesDir: string;

  beforeEach(async () => {
    const result = await createTestDbFile();
    testDb = result.db;
    dbPath = result.path;

    originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${dbPath}`;

    // テスト用のファイルディレクトリを設定
    testFilesDir = join("/tmp", `locus-test-files-${Date.now()}`);
    originalFilesDir = process.env.FILES_DIR;
    process.env.FILES_DIR = testFilesDir;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      process.env.DATABASE_URL = undefined;
    }

    if (originalFilesDir !== undefined) {
      process.env.FILES_DIR = originalFilesDir;
    } else {
      process.env.FILES_DIR = undefined;
    }

    // テスト用ファイルディレクトリを削除
    if (existsSync(testFilesDir)) {
      rmSync(testFilesDir, { recursive: true, force: true });
    }

    await cleanupTestDbFile(testDb, dbPath);
  });

  test("POST /files - ファイルをアップロードできる", async () => {
    const fileData = new ArrayBuffer(1024);
    const view = new Uint8Array(fileData);
    view.fill(65);

    const formData = new FormData();
    const blob = new Blob([fileData], { type: "application/pdf" });
    formData.append("file", blob, "test.pdf");

    const res = await app.request("/files", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.filename).toBe("test.pdf");
    expect(body.mime_type).toBe("application/pdf");
  });

  test("POST /files - ファイルが必須", async () => {
    const formData = new FormData();

    const res = await app.request("/files", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("File is required");
  });

  test("GET /files - ファイル一覧を取得できる", async () => {
    const file1 = createTestFile({ filename: "file1.pdf" });
    const file2 = createTestFile({ filename: "file2.pdf" });
    await filesDb.createFile(file1);
    await filesDb.createFile(file2);

    const res = await app.request("/files");
    expect(res.status).toBe(200);

    const files = await res.json();
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBe(2);
  });

  test("GET /files/:id - ファイルメタデータを取得できる", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    const res = await app.request(`/files/${file.id}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.id).toBe(file.id);
    expect(body.filename).toBe(file.filename);
  });

  test("GET /files/:id - 存在しないファイルは404を返す", async () => {
    const res = await app.request("/files/non-existent-id");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("File not found");
  });

  test("GET /files/:id/download - ファイルをダウンロードできる", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    // ファイルをディスクに保存
    const fileData = new ArrayBuffer(1024);
    const view = new Uint8Array(fileData);
    view.fill(65);

    const { uploadFile } = await import("../services/file-uploader.js");
    await uploadFile(file, fileData);

    const res = await app.request(`/files/${file.id}/download`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(file.mime_type);
    expect(res.headers.get("Content-Disposition")).toContain(file.filename);

    const arrayBuffer = await res.arrayBuffer();
    expect(arrayBuffer.byteLength).toBe(1024);
  });

  test("DELETE /files/:id - ファイルを削除できる", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    // ファイルをディスクに保存
    const fileData = new ArrayBuffer(1024);
    const { uploadFile } = await import("../services/file-uploader.js");
    await uploadFile(file, fileData);

    const res = await app.request(`/files/${file.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("File deleted");

    // 削除後は取得できない
    const getRes = await app.request(`/files/${file.id}`);
    expect(getRes.status).toBe(404);
  });

  test("POST /files/:id/notes - ノートとファイルを関連付けできる", async () => {
    const note = createTestNoteCore({ title: "Test Note" });
    await notesDb.createNote(note);

    const file = createTestFile();
    await filesDb.createFile(file);

    const res = await app.request(`/files/${file.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id: note.id }),
    });

    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.file_id).toBe(file.id);
    expect(body.note_id).toBe(note.id);
  });

  test("POST /files/:id/notes - note_idが必須", async () => {
    const file = createTestFile();
    await filesDb.createFile(file);

    const res = await app.request(`/files/${file.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("note_id is required");
  });

  test("DELETE /files/:id/notes/:noteId - ノートとファイルの関連を解除できる", async () => {
    const note = createTestNoteCore({ title: "Test Note" });
    await notesDb.createNote(note);

    const file = createTestFile();
    await filesDb.createFile(file);

    await filesDb.linkFileToNote(file.id, note.id);

    const res = await app.request(`/files/${file.id}/notes/${note.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("File unlinked from note");

    // 関連が解除されていることを確認
    const files = await filesDb.getFilesByNote(note.id);
    expect(files.length).toBe(0);
  });
});

