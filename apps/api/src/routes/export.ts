import { Hono } from "hono";
import JSZip from "jszip";
import { exportJSON } from "../services/export/json.js";
import { exportMarkdown } from "../services/export/markdown.js";
import { generateStaticHTML } from "../services/export/static-html.js";

const app = new Hono();

/**
 * Markdownエクスポート
 * GET /export/markdown?type=md&tags=tag1,tag2&dateFrom=1234567890&dateTo=1234567890&includeFiles=true
 * @param {string} [type] - ノートタイプ（'md' | 'rss' | 'web_clip'）
 * @param {string[]} [tags] - タグ名の配列（カンマ区切り）
 * @param {number} [dateFrom] - 開始日時（Unixタイムスタンプ）
 * @param {number} [dateTo] - 終了日時（Unixタイムスタンプ）
 * @param {boolean} [includeFiles] - ファイルを含めるかどうか
 * @returns {Promise<Response>} ZIPファイル（Content-Type: application/zip）
 * @throws {Error} エクスポートに失敗した場合
 */
app.get("/markdown", async (c) => {
  try {
    const type = c.req.query("type");
    const tagsParam = c.req.query("tags");
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()) : undefined;
    const dateFromParam = c.req.query("dateFrom");
    const dateToParam = c.req.query("dateTo");
    const includeFilesParam = c.req.query("includeFiles");

    const dateFrom = dateFromParam ? Number.parseInt(dateFromParam, 10) : undefined;
    const dateTo = dateToParam ? Number.parseInt(dateToParam, 10) : undefined;
    const includeFiles = includeFilesParam === "true";

    const zipBuffer = await exportMarkdown({
      type,
      tags,
      includeFiles,
      dateFrom,
      dateTo,
    });

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
 * GET /export/json?includeFiles=true&type=md&tags=tag1,tag2&dateFrom=1234567890&dateTo=1234567890
 * @param {boolean} [includeFiles] - ファイルを含めるかどうか（デフォルト: true）
 * @param {string} [type] - ノートタイプ（'md' | 'rss' | 'web_clip'）
 * @param {string[]} [tags] - タグ名の配列（カンマ区切り）
 * @param {number} [dateFrom] - 開始日時（Unixタイムスタンプ）
 * @param {number} [dateTo] - 終了日時（Unixタイムスタンプ）
 * @returns {Promise<Response>} JSONファイル（Content-Type: application/json）
 * @throws {Error} エクスポートに失敗した場合
 */
app.get("/json", async (c) => {
  try {
    const includeFilesParam = c.req.query("includeFiles");
    const type = c.req.query("type");
    const tagsParam = c.req.query("tags");
    const dateFromParam = c.req.query("dateFrom");
    const dateToParam = c.req.query("dateTo");

    const includeFiles = includeFilesParam !== "false";
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()) : undefined;
    const dateFrom = dateFromParam ? Number.parseInt(dateFromParam, 10) : undefined;
    const dateTo = dateToParam ? Number.parseInt(dateToParam, 10) : undefined;

    const data = await exportJSON({
      includeFiles,
      type,
      tags,
      dateFrom,
      dateTo,
    });
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

/**
 * 静的HTMLエクスポート（公開ノート用）
 * GET /export/static-html
 * @returns {Promise<Response>} ZIPファイル（Content-Type: application/zip、公開ノートの静的HTMLサイトを含む）
 * @throws {Error} エクスポートに失敗した場合
 */
app.get("/static-html", async (c) => {
  try {
    const htmlFiles = await generateStaticHTML();

    // ZIPファイルとして返す
    const zip = new JSZip();
    for (const [filename, content] of htmlFiles) {
      zip.file(filename, content);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="locus-public-site.zip"',
      },
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to export static HTML",
      },
      500
    );
  }
});

export default app;
