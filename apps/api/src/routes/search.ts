import { Hono } from "hono";
import * as searchDb from "../db/search.js";

const app = new Hono();

/**
 * 全文検索
 * GET /search?q=query&limit=100&offset=0
 */
app.get("/", async (c) => {
  const query = c.req.query("q");
  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

  const notes = await searchDb.searchNotes(query, { limit, offset });
  return c.json(notes);
});

export default app;
