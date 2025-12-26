import type { WebClip } from "@locus/shared";
import { Hono } from "hono";
import * as notesDb from "../db/notes.js";
import * as webClipsDb from "../db/web-clips.js";
import { fetchWebClip, refetchWebClip } from "../services/web-clip-fetcher.js";

const app = new Hono();

/**
 * Webクリップを作成
 * POST /web-clips
 * リクエストボディ: { url: string }
 */
app.post("/", async (c) => {
  try {
    const body = await c.req.json<{ url: string }>();

    if (!body.url || typeof body.url !== "string") {
      return c.json({ error: "URL is required" }, 400);
    }

    const result = await fetchWebClip(body.url);
    return c.json({ note: result.note, webClip: result.webClip }, 201);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch web clip",
      },
      500
    );
  }
});

/**
 * Webクリップ一覧を取得
 * GET /web-clips
 */
app.get("/", async (c) => {
  const limitParam = c.req.query("limit");
  const offsetParam = c.req.query("offset");

  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

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
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const webClip = await webClipsDb.getWebClip(id);

  if (!webClip) {
    return c.json({ error: "Web clip not found" }, 404);
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

  try {
    const result = await refetchWebClip(id);
    return c.json({ note: result.note, webClip: result.webClip });
  } catch (error) {
    if (error instanceof Error && error.message === "Web clip not found") {
      return c.json({ error: "Web clip not found" }, 404);
    }
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to refetch web clip",
      },
      500
    );
  }
});

/**
 * Webクリップを削除
 * DELETE /web-clips/:id
 */
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const webClip = await webClipsDb.getWebClip(id);

  if (!webClip) {
    return c.json({ error: "Web clip not found" }, 404);
  }

  // ノートを論理削除
  const now = Math.floor(Date.now() / 1000);
  await notesDb.deleteNote(id, now);

  // WebクリップはCASCADEで削除されるが、明示的に削除
  await webClipsDb.deleteWebClip(id);

  return c.json({ message: "Web clip deleted" });
});

export default app;
