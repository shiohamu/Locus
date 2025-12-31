import { Hono } from "hono";
import * as searchDb from "../db/search.js";
import { getQueryInt, getQueryStringRequired } from "../middleware/validation.js";

const app = new Hono();

/**
 * 全文検索
 * GET /search?q=query&limit=100&offset=0
 * @param {string} q - 検索クエリ（必須）
 * @param {number} [limit] - 取得件数の上限
 * @param {number} [offset] - 取得開始位置
 * @returns {Promise<NoteCore[]>} 検索結果のノート一覧
 * @throws {ValidationError} 検索クエリが指定されていない場合
 */
app.get("/", async (c) => {
  const query = getQueryStringRequired(c, "q");
  const limit = getQueryInt(c, "limit");
  const offset = getQueryInt(c, "offset");

  const notes = await searchDb.searchNotes(query, { limit, offset });
  return c.json(notes);
});

export default app;
