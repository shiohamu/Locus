import { Hono } from "hono";
import { exportJSON } from "../services/export/json.js";
import { exportMarkdown } from "../services/export/markdown.js";

const app = new Hono();

/**
 * Markdownエクスポート
 * GET /export/markdown?type=md&tags=tag1,tag2
 */
app.get("/markdown", async (c) => {
  try {
    const type = c.req.query("type");
    const tagsParam = c.req.query("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;

    const zipBuffer = await exportMarkdown({ type, tags });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="locus-export.zip"',
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to export markdown",
      },
      500
    );
  }
});

/**
 * JSONエクスポート
 * GET /export/json
 */
app.get("/json", async (c) => {
  try {
    const data = await exportJSON();
    const jsonString = JSON.stringify(data, null, 2);

    return new Response(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="locus-export.json"',
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to export JSON",
      },
      500
    );
  }
});

export default app;
