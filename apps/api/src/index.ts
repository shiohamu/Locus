import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import notesRoutes from "./routes/notes.js";
import notesMDRoutes from "./routes/notes_md.js";
import tagsRoutes from "./routes/tags.js";
import linksRoutes from "./routes/links.js";
import searchRoutes from "./routes/search.js";
import rssRoutes from "./routes/rss.js";
import syncRoutes from "./routes/sync.js";
import * as tagsDb from "./db/tags.js";

const app = new Hono();

// ミドルウェア
app.use("*", corsMiddleware);
app.use("*", logger);
app.onError(errorHandler);

// ルート
app.route("/notes", notesRoutes);
app.route("/notes/md", notesMDRoutes);
app.route("/notes", tagsRoutes); // /notes/:id/tags のルートを含む
app.route("/notes", linksRoutes); // /notes/:id/links のルートを含む
app.get("/tags", async (c) => {
	// タグ一覧取得は直接実装
	const tagList = await tagsDb.listTags();
	return c.json(tagList);
});
app.post("/tags", async (c) => {
	// タグ作成は直接実装
	const body = await c.req.json<{ name: string; id?: string }>();
	const id = body.id ?? crypto.randomUUID();
	const tag = { id, name: body.name };
	const existing = await tagsDb.getTagByName(body.name);
	if (existing) {
		return c.json({ error: "Tag already exists" }, 409);
	}
	const created = await tagsDb.createTag(tag);
	return c.json(created, 201);
});
app.route("/search", searchRoutes);
app.route("/rss", rssRoutes);
app.route("/sync", syncRoutes);

// ヘルスチェック
app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

// Bunの自動サーバー起動を防ぐため、export defaultは使用しない
// サーバー起動は server.ts で行う
export { app };
