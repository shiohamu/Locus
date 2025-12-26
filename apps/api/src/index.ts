import { Hono } from "hono";
import * as tagsDb from "./db/tags.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import linksRoutes from "./routes/links.js";
import notesRoutes from "./routes/notes.js";
import notesMDRoutes from "./routes/notes_md.js";
import rssRoutes from "./routes/rss.js";
import searchRoutes from "./routes/search.js";
import syncRoutes from "./routes/sync.js";
import tagsRoutes from "./routes/tags.js";

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
  try {
    const body = await c.req.json<{ name: string; id?: string }>();

    // バリデーション
    if (!body || typeof body !== "object") {
      return c.json({ error: "リクエストボディが不正です" }, 400);
    }

    if (!body.name || typeof body.name !== "string") {
      return c.json({ error: "タグ名は文字列である必要があります" }, 400);
    }

    const name = body.name.trim();
    if (name === "") {
      return c.json({ error: "タグ名を入力してください" }, 400);
    }

    const id = body.id ?? crypto.randomUUID();
    const tag = { id, name };
    const existing = await tagsDb.getTagByName(name);
    if (existing) {
      return c.json({ error: "このタグは既に存在します" }, 409);
    }
    const created = await tagsDb.createTag(tag);
    return c.json(created, 201);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return c.json({ error: "リクエストボディのJSON形式が不正です" }, 400);
    }
    throw e;
  }
});
app.delete("/tags/:id", async (c) => {
  // タグ削除
  const id = c.req.param("id");
  const existing = await tagsDb.getTag(id);
  if (!existing) {
    return c.json({ error: "Tag not found" }, 404);
  }
  await tagsDb.deleteTag(id);
  return c.json({ message: "Tag deleted" });
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
