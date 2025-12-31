import type { WebClip } from "@locus/shared";
import { Hono } from "hono";
import * as notesDb from "../db/notes.js";
import * as webClipsDb from "../db/web-clips.js";
import {
  getJsonBody,
  getQueryInt,
  validateRequired,
  validateString,
} from "../middleware/validation.js";
import { fetchWebClip, refetchWebClip } from "../services/web-clip-fetcher.js";
import { NotFoundError } from "../utils/errors.js";

const app = new Hono();

/**
 * Webクリップを作成
 * POST /web-clips
 * @param {{url: string}} body - WebクリップするURL
 * @returns {Promise<{note: NoteCore, webClip: WebClip}>} 作成されたノートとWebクリップ情報
 * @throws {ValidationError} URLが指定されていない場合
 */
app.post("/", async (c) => {
  const body = await getJsonBody<{ url: string }>(c);
  validateRequired(body, ["url"]);
  validateString(body.url, "url");

  const result = await fetchWebClip(body.url);
  return c.json({ note: result.note, webClip: result.webClip }, 201);
});

/**
 * Webクリップ一覧を取得
 * GET /web-clips?limit=100&offset=0
 * @param {number} [limit] - 取得件数の上限
 * @param {number} [offset] - 取得開始位置
 * @returns {Promise<(WebClip & {note?: NoteCore})[]>} Webクリップ一覧（ノート情報付き）
 */
app.get("/", async (c) => {
  const limit = getQueryInt(c, "limit");
  const offset = getQueryInt(c, "offset");

  const webClips = await webClipsDb.listWebClips({ limit, offset });

  // ノート情報も取得
  const webClipsWithNotes = await Promise.all(
    webClips.map(async (webClip) => {
      const note = await notesDb.getNote(webClip.note_id);
      return {
        ...webClip,
        note: note || undefined,
      };
    })
  );

  return c.json(webClipsWithNotes);
});

/**
 * Webクリップを取得
 * GET /web-clips/:id
 * @param {string} id - WebクリップID（ノートIDと同じ）
 * @returns {Promise<WebClip & {note?: NoteCore}>} Webクリップ情報（ノート情報付き）
 * @throws {NotFoundError} Webクリップが見つからない場合
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const webClip = await webClipsDb.getWebClip(id);

  if (!webClip) {
    throw new NotFoundError("Web clip", id);
  }

  const note = await notesDb.getNote(id);
  return c.json({
    ...webClip,
    note: note || undefined,
  });
});

/**
 * Webクリップを更新（再取得）
 * PUT /web-clips/:id
 * @param {string} id - WebクリップID（ノートIDと同じ）
 * @returns {Promise<{note: NoteCore, webClip: WebClip}>} 更新されたノートとWebクリップ情報
 */
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await refetchWebClip(id);
  return c.json({ note: result.note, webClip: result.webClip });
});

/**
 * Webクリップを削除
 * DELETE /web-clips/:id
 * @param {string} id - WebクリップID（ノートIDと同じ）
 * @returns {Promise<{message: string}>} 削除成功メッセージ
 * @throws {NotFoundError} Webクリップが見つからない場合
 */
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const webClip = await webClipsDb.getWebClip(id);

  if (!webClip) {
    throw new NotFoundError("Web clip", id);
  }

  // ノートを論理削除
  const now = Math.floor(Date.now() / 1000);
  await notesDb.deleteNote(id, now);

  // WebクリップはCASCADEで削除されるが、明示的に削除
  await webClipsDb.deleteWebClip(id);

  return c.json({ message: "Web clip deleted" });
});

export default app;
