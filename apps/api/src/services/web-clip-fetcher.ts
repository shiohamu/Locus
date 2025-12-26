import type { NoteCore, WebClip } from "@locus/shared";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import * as notesDb from "../db/notes.js";
import * as searchDb from "../db/search.js";
import * as webClipsDb from "../db/web-clips.js";

const turndownService = new TurndownService();

/**
 * URLからHTMLを取得する
 */
async function fetchHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 最大10MBまで読み込む
    const contentLength = response.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      throw new Error("Content too large (max 10MB)");
    }

    const text = await response.text();
    if (text.length > 10 * 1024 * 1024) {
      throw new Error("Content too large (max 10MB)");
    }

    return text;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

/**
 * HTMLからメインコンテンツを抽出し、Markdownに変換する
 */
function extractAndConvertToMarkdown(
  html: string,
  url: string
): { title: string; content: string } {
  // cheerioを使用してHTMLを解析
  const $ = cheerio.load(html);

  // タイトルを取得
  const title = $("title").text().trim() || "Untitled";

  // メインコンテンツを抽出
  // article, main, [role="main"] などの要素を優先的に探す
  let mainContent: cheerio.Cheerio<cheerio.Element> | null = null;

  const selectors = [
    "article",
    "main",
    '[role="main"]',
    ".content",
    "#content",
    ".post",
    ".entry",
    ".article-content",
  ];

  for (const selector of selectors) {
    const found = $(selector);
    if (found.length > 0) {
      mainContent = found;
      break;
    }
  }

  // メインコンテンツが見つからない場合はbody全体を使用
  if (!mainContent) {
    mainContent = $("body");
  }

  // 不要な要素を削除
  if (mainContent) {
    // 広告、ナビゲーション、フッターなどを削除
    const unwantedSelectors = [
      "nav",
      "header",
      "footer",
      ".ad",
      ".advertisement",
      ".ads",
      ".sidebar",
      ".menu",
      ".navigation",
      "script",
      "style",
      "noscript",
    ];

    for (const selector of unwantedSelectors) {
      mainContent.find(selector).remove();
    }
  }

  // Markdownに変換
  const htmlContent = mainContent ? mainContent.html() || "" : "";
  const content = htmlContent ? turndownService.turndown(htmlContent) : "";

  // ソースURLを追加
  const contentWithSource = content
    ? `${content}\n\n---\n\nSource: [${title}](${url})`
    : `Source: [${title}](${url})`;

  return { title, content: contentWithSource };
}

/**
 * Webクリップを取得し、ノートとして保存する
 */
export async function fetchWebClip(url: string): Promise<{
  note: NoteCore;
  webClip: WebClip;
}> {
  const now = Math.floor(Date.now() / 1000);

  // URLのバリデーション
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  // HTMLを取得
  const html = await fetchHTML(url);

  // HTMLからMarkdownに変換
  const { title, content } = extractAndConvertToMarkdown(html, url);

  // ノートIDを生成
  const noteId = crypto.randomUUID();

  // ノートコアを作成
  const noteCore: NoteCore = {
    id: noteId,
    type: "web_clip",
    title,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  // ノートを保存
  await notesDb.createNote(noteCore);

  // Webクリップを作成
  const webClip: WebClip = {
    note_id: noteId,
    source_url: url,
    fetched_at: now,
    content,
  };

  await webClipsDb.createWebClip(webClip);

  // FTSインデックスを更新
  await searchDb.updateFTS(noteId, title, content);

  return { note: noteCore, webClip };
}

/**
 * Webクリップを再取得して更新する
 */
export async function refetchWebClip(noteId: string): Promise<{
  note: NoteCore;
  webClip: WebClip;
}> {
  // 既存のWebクリップを取得
  const existing = await webClipsDb.getWebClip(noteId);
  if (!existing) {
    throw new Error("Web clip not found");
  }

  const now = Math.floor(Date.now() / 1000);

  // HTMLを再取得
  const html = await fetchHTML(existing.source_url);

  // HTMLからMarkdownに変換
  const { title, content } = extractAndConvertToMarkdown(html, existing.source_url);

  // ノートを更新
  const note = await notesDb.getNote(noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  const updatedNote: NoteCore = {
    ...note,
    title,
    updated_at: now,
  };

  await notesDb.updateNote(updatedNote);

  // Webクリップを更新
  const updatedWebClip: WebClip = {
    ...existing,
    fetched_at: now,
    content,
  };

  await webClipsDb.updateWebClip(updatedWebClip);

  // FTSインデックスを更新
  await searchDb.updateFTS(noteId, title, content);

  return { note: updatedNote, webClip: updatedWebClip };
}
