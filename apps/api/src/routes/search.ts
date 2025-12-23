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

	const limit = c.req.query("limit")
		? Number.parseInt(c.req.query("limit")!, 10)
		: undefined;
	const offset = c.req.query("offset")
		? Number.parseInt(c.req.query("offset")!, 10)
		: undefined;

	const notes = await searchDb.searchNotes(query, { limit, offset });
	return c.json(notes);
});

export default app;



