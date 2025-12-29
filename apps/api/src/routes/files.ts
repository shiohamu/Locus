import type { File } from "@locus/shared";
import { Hono } from "hono";
import * as filesDb from "../db/files.js";
import { deleteFileFromDisk, readFile, uploadFile } from "../services/file-uploader.js";

const app = new Hono();

/**
 * ファイルアップロード
 * POST /files
 * multipart/form-data: { file: File }
 */
app.post("/", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json({ error: "File is required" }, 400);
    }

    // ファイル情報を取得
    const fileId = crypto.randomUUID();
    const filename = file.name || "untitled";
    const mimeType = file.type || "application/octet-stream";
    const size = file.size;
    const now = Math.floor(Date.now() / 1000);

    // ファイルデータを読み込む
    const fileData = await file.arrayBuffer();

    // ファイル情報を作成
    const fileInfo: File = {
      id: fileId,
      filename,
      mime_type: mimeType,
      size,
      created_at: now,
      show_in_notes: false,
    };

    // ファイルをアップロード
    const savedFile = await uploadFile(fileInfo, fileData);

    return c.json(savedFile, 201);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      500
    );
  }
});

/**
 * ファイル一覧取得
 * GET /files?note_id=xxx
 */
app.get("/", async (c) => {
  const noteIdParam = c.req.query("note_id");
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");

  // ノートIDが指定されている場合は、そのノートに紐づくファイルを取得
  if (noteIdParam) {
    const files = await filesDb.getFilesByNote(noteIdParam);
    return c.json(files);
  }

  // 通常のファイル一覧取得
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  const files = await filesDb.listFiles({ limit, offset });
  return c.json(files);
});

/**
 * ファイルメタデータ取得
 * GET /files/:id
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const file = await filesDb.getFile(id);

  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  return c.json(file);
});

/**
 * ファイルダウンロード
 * GET /files/:id/download
 */
app.get("/:id/download", async (c) => {
  const id = c.req.param("id");
  const file = await filesDb.getFile(id);

  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  try {
    const fileData = await readFile(file.id, file.filename);
    return new Response(fileData, {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to read file",
      },
      500
    );
  }
});

/**
 * ファイル削除
 * DELETE /files/:id
 */
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const file = await filesDb.getFile(id);

  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  try {
    // ファイルシステムから削除
    await deleteFileFromDisk(file.id, file.filename);

    // データベースから削除
    await filesDb.deleteFile(id);

    return c.json({ message: "File deleted" });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      500
    );
  }
});

/**
 * ノートとファイルの関連付け
 * POST /files/:id/notes
 * リクエストボディ: { note_id: string }
 */
app.post("/:id/notes", async (c) => {
  const fileId = c.req.param("id");
  const body = await c.req.json<{ note_id: string }>();

  if (!body.note_id) {
    return c.json({ error: "note_id is required" }, 400);
  }

  const file = await filesDb.getFile(fileId);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  try {
    const fileNote = await filesDb.linkFileToNote(fileId, body.note_id);
    return c.json(fileNote, 201);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to link file to note",
      },
      500
    );
  }
});

/**
 * ノートとファイルの関連解除
 * DELETE /files/:id/notes/:noteId
 */
app.delete("/:id/notes/:noteId", async (c) => {
  const fileId = c.req.param("id");
  const noteId = c.req.param("noteId");

  const file = await filesDb.getFile(fileId);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  try {
    await filesDb.unlinkFileFromNote(fileId, noteId);
    return c.json({ message: "File unlinked from note" });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to unlink file from note",
      },
      500
    );
  }
});

/**
 * ファイル更新
 * PUT /files/:id
 * リクエストボディ: { filename?: string, show_in_notes?: boolean }
 */
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ filename?: string; show_in_notes?: boolean }>();

  const file = await filesDb.getFile(id);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  try {
    const updates: Partial<File> = {};
    if (body.filename !== undefined) {
      updates.filename = body.filename;
    }
    if (body.show_in_notes !== undefined) {
      updates.show_in_notes = body.show_in_notes;
    }

    const updated = await filesDb.updateFile(id, updates);
    return c.json(updated);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to update file",
      },
      500
    );
  }
});

export default app;
