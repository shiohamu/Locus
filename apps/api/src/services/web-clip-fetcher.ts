import type { NoteCore, WebClip } from "@locus/shared";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import type * as notesDb from "../db/notes.js";
import type * as searchDb from "../db/search.js";
import type * as webClipsDb from "../db/web-clips.js";
import { handleServiceOperation } from "./utils/error-handler.js";
import { ExternalServiceError, NotFoundError, ValidationError } from "../utils/errors.js";

const turndownService = new TurndownService();

/**
 * Webクリップ取得サービスの依存関係
 */
export interface WebClipFetcherDependencies {
	notesDb: typeof notesDb;
	webClipsDb: typeof webClipsDb;
	searchDb: typeof searchDb;
}

/**
 * Webクリップ取得サービス
 */
export class WebClipFetcherService {
	constructor(private deps: WebClipFetcherDependencies) {}

	/**
	 * URLからHTMLを取得する
	 */
	private async fetchHTML(url: string): Promise<string> {
		return handleServiceOperation(`fetchHTML(${url})`, async () => {
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
					throw new ExternalServiceError(
						"HTTP",
						`HTTP error! status: ${response.status}`,
						{ url, status: response.status },
					);
				}

				// 最大10MBまで読み込む
				const contentLength = response.headers.get("content-length");
				if (contentLength && Number.parseInt(contentLength, 10) > 10 * 1024 * 1024) {
					throw new ValidationError("Content too large (max 10MB)", { url, contentLength });
				}

				const text = await response.text();
				if (text.length > 10 * 1024 * 1024) {
					throw new ValidationError("Content too large (max 10MB)", { url, size: text.length });
				}

				return text;
			} catch (error) {
				clearTimeout(timeoutId);
				if (error instanceof Error && error.name === "AbortError") {
					throw new ExternalServiceError("HTTP", "Request timeout", { url });
				}
				throw error;
			}
		});
	}

	/**
	 * HTMLからメインコンテンツを抽出し、Markdownに変換する
	 */
	private extractAndConvertToMarkdown(
		html: string,
		url: string,
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
	async fetchWebClip(url: string): Promise<{
		note: NoteCore;
		webClip: WebClip;
	}> {
		return handleServiceOperation(`fetchWebClip(${url})`, async () => {
			const now = Math.floor(Date.now() / 1000);

			// URLのバリデーション
			try {
				new URL(url);
			} catch {
				throw new ValidationError("Invalid URL", { url });
			}

			// HTMLを取得
			const html = await this.fetchHTML(url);

			// HTMLからMarkdownに変換
			const { title, content } = this.extractAndConvertToMarkdown(html, url);

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
			await this.deps.notesDb.createNote(noteCore);

			// Webクリップを作成
			const webClip: WebClip = {
				note_id: noteId,
				source_url: url,
				fetched_at: now,
				content,
			};

			await this.deps.webClipsDb.createWebClip(webClip);

			// FTSインデックスを更新
			await this.deps.searchDb.updateFTS(noteId, title, content);

			return { note: noteCore, webClip };
		});
	}

	/**
	 * Webクリップを再取得して更新する
	 */
	async refetchWebClip(noteId: string): Promise<{
		note: NoteCore;
		webClip: WebClip;
	}> {
		return handleServiceOperation(`refetchWebClip(${noteId})`, async () => {
			// 既存のWebクリップを取得
			const existing = await this.deps.webClipsDb.getWebClip(noteId);
			if (!existing) {
				throw new NotFoundError("Web clip", noteId);
			}

			const now = Math.floor(Date.now() / 1000);

			// HTMLを再取得
			const html = await this.fetchHTML(existing.source_url);

			// HTMLからMarkdownに変換
			const { title, content } = this.extractAndConvertToMarkdown(html, existing.source_url);

			// ノートを更新
			const note = await this.deps.notesDb.getNote(noteId);
			if (!note) {
				throw new NotFoundError("Note", noteId);
			}

			const updatedNote: NoteCore = {
				...note,
				title,
				updated_at: now,
			};

			await this.deps.notesDb.updateNote(updatedNote);

			// Webクリップを更新
			const updatedWebClip: WebClip = {
				...existing,
				fetched_at: now,
				content,
			};

			await this.deps.webClipsDb.updateWebClip(updatedWebClip);

			// FTSインデックスを更新
			await this.deps.searchDb.updateFTS(noteId, title, content);

			return { note: updatedNote, webClip: updatedWebClip };
		});
	}
}

/**
 * デフォルトの依存関係を使用するWebクリップ取得サービスインスタンス
 */
let defaultWebClipFetcherService: WebClipFetcherService | null = null;

/**
 * デフォルトのWebクリップ取得サービスを取得
 */
function getDefaultWebClipFetcherService(): WebClipFetcherService {
	if (!defaultWebClipFetcherService) {
		// 動的インポートで循環依存を回避
		const notesDb = require("../db/notes.js");
		const webClipsDb = require("../db/web-clips.js");
		const searchDb = require("../db/search.js");
		defaultWebClipFetcherService = new WebClipFetcherService({
			notesDb,
			webClipsDb,
			searchDb,
		});
	}
	return defaultWebClipFetcherService;
}

/**
 * Webクリップを取得し、ノートとして保存する（後方互換性のための関数）
 * @deprecated 新しいコードでは WebClipFetcherService を直接使用してください
 */
export async function fetchWebClip(url: string): Promise<{
	note: NoteCore;
	webClip: WebClip;
}> {
	const service = getDefaultWebClipFetcherService();
	return service.fetchWebClip(url);
}

/**
 * Webクリップを再取得して更新する（後方互換性のための関数）
 * @deprecated 新しいコードでは WebClipFetcherService を直接使用してください
 */
export async function refetchWebClip(noteId: string): Promise<{
	note: NoteCore;
	webClip: WebClip;
}> {
	const service = getDefaultWebClipFetcherService();
	return service.refetchWebClip(noteId);
}
