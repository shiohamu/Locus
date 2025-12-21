import { Hono } from "hono";
import type { NoteMD, NoteCore } from "@locus/shared";
import * as notesDb from "../db/notes.js";
import * as notesMDDb from "../db/notes_md.js";
import { updateFTS } from "../db/search.js";

const app = new Hono();

/**
 * Markdownノート作成
 * POST /notes/md
 */
app.post("/", async (c) => {
	const body = await c.req.json<{
		core: NoteCore;
		md: NoteMD;
	}>();

	// ノートコアを作成
	await notesDb.createNote(body.core);

	// Markdownノートを作成
	await notesMDDb.createNoteMD(body.md);

	// FTSインデックスを更新
	await updateFTS(body.core.id, body.core.title, body.md.content);

	return c.json({ core: body.core, md: body.md }, 201);
});

/**
 * Markdownノート更新
 * PUT /notes/md/:id
 */
app.put("/:id", async (c) => {
	const id = c.req.param("id");
	const body = await c.req.json<{
		core?: Partial<NoteCore>;
		md?: Partial<NoteMD>;
	}>();

	// ノートコアの更新
	if (body.core) {
		const existing = await notesDb.getNote(id);
		if (!existing) {
			return c.json({ error: "Note not found" }, 404);
		}

		const updated: NoteCore = {
			...existing,
			...body.core,
			id, // IDは変更不可
			updated_at: Math.floor(Date.now() / 1000),
		};
		await notesDb.updateNote(updated);
	}

	// Markdownノートの更新
	let noteMD: NoteMD | null = null;
	if (body.md) {
		const existingMD = await notesMDDb.getNoteMD(id);
		if (!existingMD) {
			return c.json({ error: "Markdown note not found" }, 404);
		}

		const updatedMD: NoteMD = {
			...existingMD,
			...body.md,
			note_id: id, // IDは変更不可
		};
		noteMD = await notesMDDb.updateNoteMD(updatedMD);
	} else {
		noteMD = await notesMDDb.getNoteMD(id);
	}

	// FTSインデックスを更新
	const core = await notesDb.getNote(id);
	if (core && noteMD) {
		await updateFTS(core.id, core.title, noteMD.content);
	}

	return c.json({ core, md: noteMD });
});

export default app;


