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
import * as filesDb from "../../db/files.js";
import * as linksDb from "../../db/links.js";
import * as notesDb from "../../db/notes.js";
import * as notesMDDb from "../../db/notes_md.js";
import * as rssDb from "../../db/rss.js";
import * as tagsDb from "../../db/tags.js";
import * as webClipsDb from "../../db/web-clips.js";

/**
 * JSONエクスポートを生成
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
  const now = Math.floor(Date.now() / 1000);

  // 全データを取得（並列処理）
  const [notesResult, tagsResult, feedsResult, filesResult] = await Promise.all([
    notesDb.listNotes({ limit: 10000 }),
    tagsDb.listTags(),
    rssDb.listFeeds(),
    options?.includeFiles !== false ? filesDb.listFiles({ limit: 10000 }) : Promise.resolve([]),
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
    const notesWithTags = await notesDb.listNotesByTags({
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
        const md = await notesMDDb.getNoteMD(note.id);
        return { type: "md" as const, data: md };
      } else if (note.type === "rss") {
        const item = await rssDb.getItemByNoteId(note.id);
        return { type: "rss" as const, data: item };
      } else if (note.type === "web_clip") {
        const clip = await webClipsDb.getWebClip(note.id);
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
  const linkPromises = notes.map((note) => linksDb.getLinksByNote(note.id));
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
}
