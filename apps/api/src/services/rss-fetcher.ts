import type { NoteCore, RSSFeed, RSSItem } from "@locus/shared";
import Parser from "rss-parser";
import TurndownService from "turndown";
import type * as notesDb from "../db/notes.js";
import type * as rssDb from "../db/rss.js";
import type * as searchDb from "../db/search.js";
import { ExternalServiceError, ValidationError } from "../utils/errors.js";
import { handleServiceOperation } from "./utils/error-handler.js";

const parser = new Parser();
const turndownService = new TurndownService();

/**
 * RSSフィード取得サービスの依存関係
 */
export interface RSSFetcherDependencies {
  notesDb: typeof notesDb;
  rssDb: typeof rssDb;
  searchDb: typeof searchDb;
}

/**
 * RSSフィード取得サービス
 */
export class RSSFetcherService {
  constructor(private deps: RSSFetcherDependencies) {}

  /**
   * RSSフィードを取得し、ノートとして保存する
   * @param {RSSFeed} feed - 取得するRSSフィード
   * @returns {Promise<{created: number, updated: number}>} 作成されたアイテム数と更新されたアイテム数
   * @throws {ExternalServiceError} RSSフィードの取得・パースに失敗した場合
   */
  async fetchRSSFeed(feed: RSSFeed): Promise<{
    created: number;
    updated: number;
  }> {
    return handleServiceOperation(`fetchRSSFeed(${feed.id})`, async () => {
      const now = Math.floor(Date.now() / 1000);

      // RSSフィードを取得
      let parsed;
      try {
        parsed = await parser.parseURL(feed.url);
      } catch (error) {
        throw new ExternalServiceError("RSS Parser", `Failed to parse RSS feed: ${feed.url}`, {
          url: feed.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // 既存のアイテムを取得（重複チェック用）
      const existingItems = await this.deps.rssDb.getItemsByFeed(feed.id);
      const existingUrls = new Set(existingItems.map((item) => item.url));

      let created = 0;
      const updated = 0;

      // 各アイテムを処理
      for (const item of parsed.items) {
        if (!item.link || !item.title) {
          continue;
        }

        // 既に存在する場合はスキップ
        if (existingUrls.has(item.link)) {
          continue;
        }

        // 公開日時を取得
        const publishedAt = item.pubDate
          ? Math.floor(new Date(item.pubDate).getTime() / 1000)
          : now;

        // HTMLコンテンツをMarkdownに変換
        const content = item.contentSnippet || item.content || "";
        const markdown = content ? turndownService.turndown(content) : item.title;

        // ノートIDを生成
        const noteId = crypto.randomUUID();

        // ノートコアを作成
        const noteCore: NoteCore = {
          id: noteId,
          type: "rss",
          title: item.title,
          created_at: publishedAt,
          updated_at: publishedAt,
          deleted_at: null,
        };

        // ノートを保存
        await this.deps.notesDb.createNote(noteCore);

        // RSSアイテムを作成
        const rssItem: RSSItem = {
          note_id: noteId,
          feed_id: feed.id,
          url: item.link,
          content: markdown,
          published_at: publishedAt,
        };

        await this.deps.rssDb.createItem(rssItem);

        // FTSインデックスを更新
        await this.deps.searchDb.updateFTS(noteId, item.title, markdown);

        created++;
      }

      // フィードの最終取得日時を更新
      const updatedFeed: RSSFeed = {
        ...feed,
        last_fetched_at: now,
      };
      await this.deps.rssDb.updateFeed(updatedFeed);

      return { created, updated };
    });
  }
}

/**
 * デフォルトの依存関係を使用するRSSフィード取得サービスインスタンス
 */
let defaultRSSFetcherService: RSSFetcherService | null = null;

/**
 * デフォルトのRSSフィード取得サービスを取得
 */
function getDefaultRSSFetcherService(): RSSFetcherService {
  if (!defaultRSSFetcherService) {
    // 動的インポートで循環依存を回避
    const notesDb = require("../db/notes.js");
    const rssDb = require("../db/rss.js");
    const searchDb = require("../db/search.js");
    defaultRSSFetcherService = new RSSFetcherService({
      notesDb,
      rssDb,
      searchDb,
    });
  }
  return defaultRSSFetcherService;
}

/**
 * RSSフィードを取得し、ノートとして保存する（後方互換性のための関数）
 * @deprecated 新しいコードでは RSSFetcherService を直接使用してください
 */
export async function fetchRSSFeed(feed: RSSFeed): Promise<{
  created: number;
  updated: number;
}> {
  const service = getDefaultRSSFetcherService();
  return service.fetchRSSFeed(feed);
}
