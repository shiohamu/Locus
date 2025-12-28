import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { rmSync } from "node:fs";
import { join } from "node:path";
import type { Client } from "@libsql/client";
import type { File } from "@locus/shared";
import * as filesDb from "../db/files.js";
import { cleanupTestDbFile, createTestDbFile, createTestFile } from "../test/helpers.js";
import { deleteFileFromDisk, readFile, uploadFile } from "./file-uploader.js";

describe("file-uploader", () => {
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

  test("uploadFile - ファイルをアップロードできる", async () => {
    const file = createTestFile();
    const fileData = new ArrayBuffer(1024);
    const view = new Uint8Array(fileData);
    view.fill(65); // 'A'で埋める

    const savedFile = await uploadFile(file, fileData);

    expect(savedFile.id).toBe(file.id);
    expect(savedFile.filename).toBe(file.filename);

    // データベースに保存されていることを確認
    const retrieved = await filesDb.getFile(file.id);
    expect(retrieved).not.toBeNull();

    // ファイルが保存されていることを確認
    const filePath = join(testFilesDir, file.id, file.filename);
    expect(existsSync(filePath)).toBe(true);
  });

  test("uploadFile - ファイル名がサニタイズされる", async () => {
    const file = createTestFile({ filename: "../../../evil.pdf" });
    const fileData = new ArrayBuffer(1024);

    const savedFile = await uploadFile(file, fileData);

    // 危険な文字が除去されていることを確認
    expect(savedFile.filename).not.toContain("../");
    expect(savedFile.filename).not.toContain("..");
  });

  test("uploadFile - ファイルサイズ制限でエラーが発生する", async () => {
    const originalMaxSize = process.env.MAX_FILE_SIZE;
    process.env.MAX_FILE_SIZE = "1024"; // 1KB

    const file = createTestFile({ size: 2048 });
    const fileData = new ArrayBuffer(2048);

    await expect(uploadFile(file, fileData)).rejects.toThrow("exceeds maximum allowed size");

    if (originalMaxSize !== undefined) {
      process.env.MAX_FILE_SIZE = originalMaxSize;
    } else {
      process.env.MAX_FILE_SIZE = undefined;
    }
  });

  test("uploadFile - 無効なMIMEタイプでエラーが発生する", async () => {
    const file = createTestFile({ mime_type: "application/x-executable" });
    const fileData = new ArrayBuffer(1024);

    await expect(uploadFile(file, fileData)).rejects.toThrow("MIME type");
  });

  test("readFile - ファイルを読み込める", async () => {
    const file = createTestFile();
    const fileData = new ArrayBuffer(1024);
    const view = new Uint8Array(fileData);
    view.fill(66); // 'B'で埋める

    await uploadFile(file, fileData);

    const readData = await readFile(file.id, file.filename);
    expect(readData.length).toBe(1024);
    expect(readData[0]).toBe(66);
  });

  test("deleteFileFromDisk - ファイルを削除できる", async () => {
    const file = createTestFile();
    const fileData = new ArrayBuffer(1024);

    await uploadFile(file, fileData);

    const filePath = join(testFilesDir, file.id, file.filename);
    expect(existsSync(filePath)).toBe(true);

    await deleteFileFromDisk(file.id, file.filename);

    expect(existsSync(filePath)).toBe(false);
  });
});
