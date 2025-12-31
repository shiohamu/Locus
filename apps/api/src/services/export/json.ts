import type {
  File as FileType,
  Link,
  NoteCore,
  NoteMD,
  RSSFeed,
  RSSItem,
  Tag,
  WebClip,
} from "@locus/shared";
import type * as filesDb from "../../db/files.js";
import type * as linksDb from "../../db/links.js";
import type * as notesDb from "../../db/notes.js";
import type * as notesMDDb from "../../db/notes_md.js";
import type * as rssDb from "../../db/rss.js";
import type * as tagsDb from "../../db/tags.js";
import type * as webClipsDb from "../../db/web-clips.js";
import { handleServiceOperation } from "../utils/error-handler.js";

/**
 * JSONエクスポートサービスの依存関係
 */
export interface JSONExportDependencies {
  filesDb: typeof filesDb;
  linksDb: typeof linksDb;
  notesDb: typeof notesDb;
  notesMDDb: typeof notesMDDb;
  rssDb: typeof rssDb;
  tagsDb: typeof tagsDb;
  webClipsDb: typeof webClipsDb;
}

/**
 * JSONエクスポートサービス
 */
export class JSONExportService {
  constructor(private deps: JSONExportDependencies) {}

  /**
   * JSONエクスポートを生成
   */
  async exportJSON(options?: {
    includeFiles?: boolean;
    type?: string;
    tags?: string[];
    dateFrom?: number;
    dateTo?: number;
  }): Promise<{
    version: string;
    exported_at: number;
    notes: NoteCore[];
    notes_md: NoteMD[];
    tags: Tag[];
    links: Link[];
    rss_feeds: RSSFeed[];
    rss_items: RSSItem[];
    web_clips: WebClip[];
    files?: FileType[];
  }> {
    return handleServiceOperation("exportJSON", async () => {
      const now = Math.floor(Date.now() / 1000);

      // 全データを取得（並列処理）
      const [notesResult, tagsResult, feedsResult, filesResult] = await Promise.all([
        this.deps.notesDb.listNotes({ limit: 10000 }),
        this.deps.tagsDb.listTags(),
        this.deps.rssDb.listFeeds(),
        options?.includeFiles !== false
          ? this.deps.filesDb.listFiles({ limit: 10000 })
          : Promise.resolve([]),
      ]);

      let notes = notesResult;
      const tags = tagsResult;
      const feeds = feedsResult;
      const files = filesResult;

      // フィルタリング
      if (options?.type) {
        notes = notes.filter((note) => note.type === options.type);
      }
      if (options?.dateFrom) {
        notes = notes.filter((note) => note.created_at >= options.dateFrom!);
      }
      if (options?.dateTo) {
        notes = notes.filter((note) => note.created_at <= options.dateTo!);
      }
      if (options?.tags && options.tags.length > 0) {
        const notesWithTags = await this.deps.notesDb.listNotesByTags({
          tagNames: options.tags,
          type: options.type as "md" | "rss" | "web_clip" | undefined,
          limit: 10000,
        });
        const noteIds = new Set(notesWithTags.map((n) => n.id));
        notes = notes.filter((note) => noteIds.has(note.id));
      }

      // ノートの詳細情報を取得（並列処理で最適化）
      const noteDetailsPromises = notes.map(async (note) => {
        try {
          if (note.type === "md") {
            const md = await this.deps.notesMDDb.getNoteMD(note.id);
            return { type: "md" as const, data: md };
          } else if (note.type === "rss") {
            const item = await this.deps.rssDb.getItemByNoteId(note.id);
            return { type: "rss" as const, data: item };
          } else if (note.type === "web_clip") {
            const clip = await this.deps.webClipsDb.getWebClip(note.id);
            return { type: "web_clip" as const, data: clip };
          }
          return null;
        } catch (error) {
          console.error(`Failed to get details for note ${note.id}:`, error);
          return null;
        }
      });

      const noteDetailsResults = await Promise.all(noteDetailsPromises);
      const notesMD: NoteMD[] = [];
      const rssItems: RSSItem[] = [];
      const webClips: WebClip[] = [];

      for (const result of noteDetailsResults) {
        if (!result) continue;
        if (result.type === "md" && result.data) {
          notesMD.push(result.data);
        } else if (result.type === "rss" && result.data) {
          rssItems.push(result.data);
        } else if (result.type === "web_clip" && result.data) {
          webClips.push(result.data);
        }
      }

      // 全リンクを取得（並列処理で最適化）
      const linkPromises = notes.map((note) => this.deps.linksDb.getLinksByNote(note.id));
      const linkResults = await Promise.all(linkPromises);
      const allLinks: Link[] = [];
      for (const links of linkResults) {
        allLinks.push(...links.outgoing);
      }

      // 重複を除去
      const uniqueLinks = Array.from(
        new Map(allLinks.map((link) => [`${link.from_note_id}-${link.to_note_id}`, link])).values()
      );

      const result: {
        version: string;
        exported_at: number;
        notes: NoteCore[];
        notes_md: NoteMD[];
        tags: Tag[];
        links: Link[];
        rss_feeds: RSSFeed[];
        rss_items: RSSItem[];
        web_clips: WebClip[];
        files?: FileType[];
      } = {
        version: "1.0",
        exported_at: now,
        notes,
        notes_md: notesMD,
        tags,
        links: uniqueLinks,
        rss_feeds: feeds,
        rss_items: rssItems,
        web_clips: webClips,
      };

      if (options?.includeFiles !== false) {
        result.files = files;
      }

      return result;
    });
  }
}

/**
 * デフォルトの依存関係を使用するJSONエクスポートサービスインスタンス
 */
let defaultJSONExportService: JSONExportService | null = null;

/**
 * デフォルトのJSONエクスポートサービスを取得
 */
function getDefaultJSONExportService(): JSONExportService {
  if (!defaultJSONExportService) {
    // 動的インポートで循環依存を回避
    const filesDb = require("../../db/files.js");
    const linksDb = require("../../db/links.js");
    const notesDb = require("../../db/notes.js");
    const notesMDDb = require("../../db/notes_md.js");
    const rssDb = require("../../db/rss.js");
    const tagsDb = require("../../db/tags.js");
    const webClipsDb = require("../../db/web-clips.js");
    defaultJSONExportService = new JSONExportService({
      filesDb,
      linksDb,
      notesDb,
      notesMDDb,
      rssDb,
      tagsDb,
      webClipsDb,
    });
  }
  return defaultJSONExportService;
}

/**
 * JSONエクスポートを生成（後方互換性のための関数）
 * @deprecated 新しいコードでは JSONExportService を直接使用してください
 */
export async function exportJSON(options?: {
  includeFiles?: boolean;
  type?: string;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
}): Promise<{
  version: string;
  exported_at: number;
  notes: NoteCore[];
  notes_md: NoteMD[];
  tags: Tag[];
  links: Link[];
  rss_feeds: RSSFeed[];
  rss_items: RSSItem[];
  web_clips: WebClip[];
  files?: FileType[];
}> {
  const service = getDefaultJSONExportService();
  return service.exportJSON(options);
}
