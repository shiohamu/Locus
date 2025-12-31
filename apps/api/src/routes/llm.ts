import type { LLMConfig } from "@locus/shared";
import { Hono } from "hono";
import * as notesDb from "../db/notes.js";
import * as notesMdDb from "../db/notes_md.js";
import * as rssDb from "../db/rss.js";
import * as webClipsDb from "../db/web-clips.js";
import { keepAliveMiddleware } from "../middleware/keep-alive.js";
import { createLLMProvider, getLLMConfig, getLLMConfigFromEnv } from "../services/llm/factory.js";
import { SummarizerService } from "../services/llm/summarizer.js";

const app = new Hono();

// Keep-Aliveミドルウェアを適用（長時間実行されるリクエスト用）
app.use("*", keepAliveMiddleware);

/**
 * LLM設定を取得
 */
async function getLLMProvider() {
  const config = await getLLMConfig();
  if (!config) {
    throw new Error("LLM is not configured. Please configure LLM settings in the settings page.");
  }
  const provider = createLLMProvider(config);
  return { provider, config };
}

/**
 * ノート要約
 * POST /llm/notes/:id/summarize
 * @param {string} id - ノートID
 * @returns {Promise<{summary: string}>} ノートの要約
 * @throws {Error} ノートが見つからない場合（404）、コンテンツが見つからない場合（404）、LLMが設定されていない場合、タイムアウト（504）
 * @description MarkdownノートまたはWebクリップの要約を生成します（タイムアウト: 3分）
 */
app.post("/notes/:id/summarize", async (c) => {
  try {
    const noteId = c.req.param("id");
    const note = await notesDb.getNote(noteId);
    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    let content: string | null = null;

    // ノートタイプに応じてコンテンツを取得
    if (note.type === "md") {
      const noteMd = await notesMdDb.getNoteMD(noteId);
      if (!noteMd) {
        return c.json({ error: "Note content not found" }, 404);
      }
      content = noteMd.content;
    } else if (note.type === "web_clip") {
      const webClip = await webClipsDb.getWebClip(noteId);
      if (!webClip) {
        return c.json({ error: "Web clip content not found" }, 404);
      }
      content = webClip.content;
    } else {
      return c.json({ error: "Unsupported note type for summarization" }, 400);
    }

    if (!content) {
      return c.json({ error: "Note content not found" }, 404);
    }

    const { provider } = await getLLMProvider();
    const summarizer = new SummarizerService(provider);

    // タイムアウトを長めに設定（3分）
    const summary = await Promise.race([
      summarizer.summarizeNote(content),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("要約処理がタイムアウトしました（3分）")), 180000)
      ),
    ]);

    return c.json({ summary });
  } catch (error) {
    if (error instanceof Error) {
      // タイムアウトエラーの場合はより詳細なメッセージを返す
      if (error.message.includes("timeout") || error.message.includes("タイムアウト")) {
        return c.json(
          {
            error:
              "LLM処理がタイムアウトしました。コンテンツが長すぎるか、LLMサービスが応答していない可能性があります。",
          },
          504
        );
      }
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * RSS記事要約
 * POST /llm/rss/:id/summarize
 * @param {string} id - ノートID（RSSアイテムのノートID）
 * @returns {Promise<{summary: string}>} RSS記事の要約
 * @throws {Error} RSSアイテムが見つからない場合（404）、ノートが見つからない場合（404）、LLMが設定されていない場合、タイムアウト（504）
 * @description RSS記事の要約を生成します（タイムアウト: 3分）
 */
app.post("/rss/:id/summarize", async (c) => {
  try {
    const noteId = c.req.param("id");
    const item = await rssDb.getItemByNoteId(noteId);
    if (!item) {
      return c.json({ error: "RSS item not found" }, 404);
    }

    const note = await notesDb.getNote(noteId);
    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    const { provider } = await getLLMProvider();
    const summarizer = new SummarizerService(provider);

    // タイムアウトを長めに設定（3分）
    const summary = await Promise.race([
      summarizer.summarizeRSSArticle(note.title, item.content),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("要約処理がタイムアウトしました（3分）")), 180000)
      ),
    ]);

    return c.json({ summary });
  } catch (error) {
    if (error instanceof Error) {
      // タイムアウトエラーの場合はより詳細なメッセージを返す
      if (error.message.includes("timeout") || error.message.includes("タイムアウト")) {
        return c.json(
          {
            error:
              "LLM処理がタイムアウトしました。コンテンツが長すぎるか、LLMサービスが応答していない可能性があります。",
          },
          504
        );
      }
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * 要点抽出
 * POST /llm/extract-key-points
 * @param {{content: string}} body - 抽出するコンテンツ
 * @returns {Promise<{keyPoints: string[]}>} 抽出された要点の配列
 * @throws {Error} コンテンツが指定されていない場合（400）、LLMが設定されていない場合、タイムアウト（504）
 * @description コンテンツから要点を抽出します（タイムアウト: 3分）
 */
app.post("/extract-key-points", async (c) => {
  try {
    const body = await c.req.json<{ content: string }>();
    if (!body.content || typeof body.content !== "string") {
      return c.json({ error: "Content is required" }, 400);
    }

    const { provider } = await getLLMProvider();
    const summarizer = new SummarizerService(provider);

    // タイムアウトを長めに設定（3分）
    const keyPoints = await Promise.race([
      summarizer.extractKeyPoints(body.content),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("要点抽出処理がタイムアウトしました（3分）")), 180000)
      ),
    ]);

    return c.json({ keyPoints });
  } catch (error) {
    if (error instanceof Error) {
      // タイムアウトエラーの場合はより詳細なメッセージを返す
      if (error.message.includes("timeout") || error.message.includes("タイムアウト")) {
        return c.json(
          {
            error:
              "LLM処理がタイムアウトしました。コンテンツが長すぎるか、LLMサービスが応答していない可能性があります。",
          },
          504
        );
      }
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * LLM設定取得
 * GET /llm/config
 * @returns {Promise<{config: Omit<LLMConfig, 'apiKey'> & {apiKey?: boolean}, available: boolean}>} LLM設定と利用可能性
 * @throws {Error} LLM設定が見つからない場合（404）、取得に失敗した場合（500）
 * @description LLM設定とLLMプロバイダーの利用可能性を取得します
 */
app.get("/config", async (c) => {
  try {
    const config = await getLLMConfig();
    if (!config) {
      return c.json({ error: "LLM is not configured" }, 404);
    }

    // 機密情報を除外
    const safeConfig: Omit<LLMConfig, "apiKey"> & { apiKey?: boolean } = {
      ...config,
      apiKey: config.apiKey ? true : undefined,
    };

    const { provider } = await getLLMProvider();
    const isAvailable = await provider.isAvailable();

    return c.json({
      config: safeConfig,
      available: isAvailable,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
