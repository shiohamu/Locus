import type { File } from "@locus/shared";
import { Hono } from "hono";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import * as filesDb from "../db/files.js";
import { deleteFileFromDisk, readFile, uploadFile } from "../services/file-uploader.js";
import { getQueryInt, getQueryString, getJsonBody, validateRequired, validateString, validateUUID } from "../middleware/validation.js";

const app = new Hono();

/**
 * ファイルアップロード
 * POST /files
 * multipart/form-data: { file: File }
 */
app.post("/", async (c) => {
	const formData = await c.req.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		throw new ValidationError("File is required");
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
});

/**
 * ファイル一覧取得
 * GET /files?note_id=xxx
 */
app.get("/", async (c) => {
	const noteId = getQueryString(c, "note_id");
	const limit = getQueryInt(c, "limit");
	const offset = getQueryInt(c, "offset");

	// ノートIDが指定されている場合は、そのノートに紐づくファイルを取得
	if (noteId) {
		const files = await filesDb.getFilesByNote(noteId);
		return c.json(files);
	}

	// 通常のファイル一覧取得
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
		throw new NotFoundError("File", id);
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
		throw new NotFoundError("File", id);
	}

	const fileData = await readFile(file.id, file.filename);
	return new Response(fileData, {
		headers: {
			"Content-Type": file.mime_type,
			"Content-Disposition": `attachment; filename="${file.filename}"`,
		},
	});
});

/**
 * ファイル削除
 * DELETE /files/:id
 */
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	const file = await filesDb.getFile(id);

	if (!file) {
		throw new NotFoundError("File", id);
	}

	// ファイルシステムから削除
	await deleteFileFromDisk(file.id, file.filename);

	// データベースから削除
	await filesDb.deleteFile(id);

	return c.json({ message: "File deleted" });
});

/**
 * ノートとファイルの関連付け
 * POST /files/:id/notes
 * リクエストボディ: { note_id: string }
 */
app.post("/:id/notes", async (c) => {
	const fileId = c.req.param("id");
	const body = await getJsonBody<{ note_id: string }>(c);
	validateRequired(body, ["note_id"]);
	validateString(body.note_id, "note_id");

	const file = await filesDb.getFile(fileId);
	if (!file) {
		throw new NotFoundError("File", fileId);
	}

	const fileNote = await filesDb.linkFileToNote(fileId, body.note_id);
	return c.json(fileNote, 201);
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
		throw new NotFoundError("File", fileId);
	}

	await filesDb.unlinkFileFromNote(fileId, noteId);
	return c.json({ message: "File unlinked from note" });
});

/**
 * ファイル更新
 * PUT /files/:id
 * リクエストボディ: { filename?: string, show_in_notes?: boolean }
 */
app.put("/:id", async (c) => {
	const id = c.req.param("id");
	const body = await getJsonBody<{ filename?: string; show_in_notes?: boolean }>(c);

	const file = await filesDb.getFile(id);
	if (!file) {
		throw new NotFoundError("File", id);
	}

	const updates: Partial<File> = {};
	if (body.filename !== undefined) {
		updates.filename = body.filename;
	}
	if (body.show_in_notes !== undefined) {
		updates.show_in_notes = body.show_in_notes;
	}

	const updated = await filesDb.updateFile(id, updates);
	return c.json(updated);
});

export default app;
