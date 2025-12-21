import { Hono } from "hono";
import type { Tag, NoteTag } from "@locus/shared";
import * as tagsDb from "../db/tags.js";

const app = new Hono();

/**
 * ノートにタグ追加
 * POST /notes/:id/tags
 */
app.post("/:id/tags", async (c) => {
	const noteId = c.req.param("id");
	const body = await c.req.json<{ tag_id: string }>();

	const noteTag: NoteTag = {
		note_id: noteId,
		tag_id: body.tag_id,
	};

	await tagsDb.addTagToNote(noteTag);
	return c.json({ message: "Tag added to note" }, 201);
});

/**
 * ノートからタグ削除
 * DELETE /notes/:id/tags/:tag
 */
app.delete("/:id/tags/:tag", async (c) => {
	const noteId = c.req.param("id");
	const tagId = c.req.param("tag");

	await tagsDb.removeTagFromNote(noteId, tagId);
	return c.json({ message: "Tag removed from note" });
});

export default app;

