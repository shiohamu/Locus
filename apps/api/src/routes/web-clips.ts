import type { WebClip } from "@locus/shared";
import { Hono } from "hono";
import { NotFoundError } from "../utils/errors.js";
import * as notesDb from "../db/notes.js";
import * as webClipsDb from "../db/web-clips.js";
import { fetchWebClip, refetchWebClip } from "../services/web-clip-fetcher.js";
import { getQueryInt, getJsonBody, validateRequired, validateString } from "../middleware/validation.js";

const app = new Hono();

/**
 * Webクリップを作成
 * POST /web-clips
 * リクエストボディ: { url: string }
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
 * GET /web-clips
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
		}),
	);

	return c.json(webClipsWithNotes);
});

/**
 * Webクリップを取得
 * GET /web-clips/:id
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
 */
app.put("/:id", async (c) => {
	const id = c.req.param("id");
	const result = await refetchWebClip(id);
	return c.json({ note: result.note, webClip: result.webClip });
});

/**
 * Webクリップを削除
 * DELETE /web-clips/:id
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
