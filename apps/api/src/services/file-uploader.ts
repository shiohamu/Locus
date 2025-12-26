import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { File } from "@locus/shared";
import * as filesDb from "../db/files.js";

/**
 * ファイル保存先のベースディレクトリ
 */
const FILES_BASE_DIR = process.env.FILES_DIR || join(process.cwd(), "apps/api/data/files");

/**
 * ファイル保存ディレクトリを初期化
 */
function ensureFilesDirectory() {
  if (!existsSync(FILES_BASE_DIR)) {
    mkdirSync(FILES_BASE_DIR, { recursive: true });
  }
}

/**
 * ファイル保存パスを取得
 */
function getFilePath(fileId: string, filename: string): string {
  const fileDir = join(FILES_BASE_DIR, fileId);
  if (!existsSync(fileDir)) {
    mkdirSync(fileDir, { recursive: true });
  }
  return join(fileDir, filename);
}

/**
 * ファイル名をサニタイズ
 */
function sanitizeFilename(filename: string): string {
  // 危険な文字を削除または置換
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\./, "_");
}

/**
 * MIMEタイプを検証
 */
function isValidMimeType(mimeType: string): boolean {
  // PDF、画像、テキストを許可
  const allowedTypes = ["application/pdf", "image/", "text/"];

  return allowedTypes.some((type) => mimeType.startsWith(type));
}

/**
 * ファイルサイズ制限（デフォルト50MB）
 */
const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || "52428800", 10); // 50MB

/**
 * ファイルをアップロードして保存する
 */
export async function uploadFile(file: File, fileData: ArrayBuffer): Promise<File> {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
  }

  // MIMEタイプ検証
  if (!isValidMimeType(file.mime_type)) {
    throw new Error(`MIME type ${file.mime_type} is not allowed`);
  }

  // ファイル名をサニタイズ
  const sanitizedFilename = sanitizeFilename(file.filename);

  // ファイル保存ディレクトリを確保
  ensureFilesDirectory();

  // ファイルを保存
  const filePath = getFilePath(file.id, sanitizedFilename);
  await Bun.write(filePath, fileData);

  // データベースにメタデータを保存
  const savedFile: File = {
    ...file,
    filename: sanitizedFilename,
  };

  await filesDb.createFile(savedFile);

  return savedFile;
}

/**
 * ファイルを読み込む
 */
export async function readFile(fileId: string, filename: string): Promise<Buffer> {
  const filePath = getFilePath(fileId, filename);
  const file = Bun.file(filePath);
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * ファイルを削除する
 */
export async function deleteFileFromDisk(fileId: string, filename: string): Promise<void> {
  const filePath = getFilePath(fileId, filename);
  const { unlink, rmdir } = await import("fs/promises");
  try {
    await unlink(filePath);
    // ディレクトリが空なら削除
    const fileDir = join(FILES_BASE_DIR, fileId);
    try {
      await rmdir(fileDir);
    } catch {
      // ディレクトリが空でない場合は無視
    }
  } catch (error) {
    // ファイルが存在しない場合は無視
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
