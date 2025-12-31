import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { File } from "@locus/shared";
import type * as filesDb from "../db/files.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { handleServiceOperation } from "./utils/error-handler.js";

/**
 * ファイル保存先のベースディレクトリを取得
 */
function getFilesBaseDir(): string {
  return process.env.FILES_DIR || join(process.cwd(), "apps/api/data/files");
}

/**
 * ファイル保存ディレクトリを初期化
 */
function ensureFilesDirectory() {
  const baseDir = getFilesBaseDir();
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }
}

/**
 * ファイル保存パスを取得
 */
function getFilePath(fileId: string, filename: string): string {
  const baseDir = getFilesBaseDir();
  const fileDir = join(baseDir, fileId);
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
 * ファイルサイズ制限を取得（デフォルト50MB）
 */
function getMaxFileSize(): number {
  return Number.parseInt(process.env.MAX_FILE_SIZE || "52428800", 10); // 50MB
}

/**
 * ファイルアップロードサービスの依存関係
 */
export interface FileUploaderDependencies {
  filesDb: typeof filesDb;
}

/**
 * ファイルアップロードサービス
 */
export class FileUploaderService {
  constructor(private deps: FileUploaderDependencies) {}

  /**
   * ファイルをアップロードして保存する
   */
  async uploadFile(file: File, fileData: ArrayBuffer): Promise<File> {
    return handleServiceOperation(`uploadFile(${file.id})`, async () => {
      const MAX_FILE_SIZE = getMaxFileSize();

      // ファイルサイズチェック（file.sizeとfileData.byteLengthの両方をチェック）
      const actualSize = fileData.byteLength;
      if (file.size > MAX_FILE_SIZE || actualSize > MAX_FILE_SIZE) {
        throw new ValidationError(
          `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
          { fileId: file.id, size: actualSize, maxSize: MAX_FILE_SIZE }
        );
      }

      // MIMEタイプ検証
      if (!isValidMimeType(file.mime_type)) {
        throw new ValidationError(`MIME type ${file.mime_type} is not allowed`, {
          fileId: file.id,
          mimeType: file.mime_type,
        });
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

      await this.deps.filesDb.createFile(savedFile);

      return savedFile;
    });
  }

  /**
   * ファイルを読み込む
   */
  async readFile(fileId: string, filename: string): Promise<Buffer> {
    return handleServiceOperation(`readFile(${fileId})`, async () => {
      const filePath = getFilePath(fileId, filename);
      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        throw new NotFoundError("File", fileId);
      }
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });
  }

  /**
   * ファイルを削除する
   */
  async deleteFileFromDisk(fileId: string, filename: string): Promise<void> {
    return handleServiceOperation(`deleteFileFromDisk(${fileId})`, async () => {
      const filePath = getFilePath(fileId, filename);
      const { unlink, rmdir } = await import("fs/promises");
      try {
        await unlink(filePath);
        // ディレクトリが空なら削除
        const baseDir = getFilesBaseDir();
        const fileDir = join(baseDir, fileId);
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
    });
  }
}

/**
 * デフォルトの依存関係を使用するファイルアップロードサービスインスタンス
 */
let defaultFileUploaderService: FileUploaderService | null = null;

/**
 * デフォルトのファイルアップロードサービスを取得
 */
function getDefaultFileUploaderService(): FileUploaderService {
  if (!defaultFileUploaderService) {
    // 動的インポートで循環依存を回避
    const filesDb = require("../db/files.js");
    defaultFileUploaderService = new FileUploaderService({
      filesDb,
    });
  }
  return defaultFileUploaderService;
}

/**
 * ファイルをアップロードして保存する（後方互換性のための関数）
 * @deprecated 新しいコードでは FileUploaderService を直接使用してください
 */
export async function uploadFile(file: File, fileData: ArrayBuffer): Promise<File> {
  const service = getDefaultFileUploaderService();
  return service.uploadFile(file, fileData);
}

/**
 * ファイルを読み込む（後方互換性のための関数）
 * @deprecated 新しいコードでは FileUploaderService を直接使用してください
 */
export async function readFile(fileId: string, filename: string): Promise<Buffer> {
  const service = getDefaultFileUploaderService();
  return service.readFile(fileId, filename);
}

/**
 * ファイルを削除する（後方互換性のための関数）
 * @deprecated 新しいコードでは FileUploaderService を直接使用してください
 */
export async function deleteFileFromDisk(fileId: string, filename: string): Promise<void> {
  const service = getDefaultFileUploaderService();
  return service.deleteFileFromDisk(fileId, filename);
}
