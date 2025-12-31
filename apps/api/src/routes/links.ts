import { Hono } from "hono";
import * as linksDb from "../db/links.js";

const app = new Hono();

/**
 * ノートのリンク取得（双方向）
 * GET /notes/:id/links
 * @param {string} id - ノートID
 * @returns {Promise<{outgoing: Link[], incoming: Link[]}>} 双方向のリンク情報
 */
app.get("/:id/links", async (c) => {
  const noteId = c.req.param("id");
  const links = await linksDb.getLinksByNote(noteId);
  return c.json(links);
});

export default app;
