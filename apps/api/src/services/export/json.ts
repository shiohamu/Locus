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
export async function exportJSON(): Promise<{
  version: string;
  exported_at: number;
  notes: NoteCore[];
  notes_md: NoteMD[];
  tags: Tag[];
  links: Link[];
  rss_feeds: RSSFeed[];
  rss_items: RSSItem[];
  web_clips: WebClip[];
  files: FileType[];
}> {
  const now = Math.floor(Date.now() / 1000);

  // 全データを取得
  const notes = await notesDb.listNotes({ limit: 10000 });
  const tags = await tagsDb.listTags();
  const feeds = await rssDb.listFeeds();
  const files = await filesDb.listFiles({ limit: 10000 });

  // ノートの詳細情報を取得
  const notesMD: NoteMD[] = [];
  const rssItems: RSSItem[] = [];
  const webClips: WebClip[] = [];

  for (const note of notes) {
    if (note.type === "md") {
      const md = await notesMDDb.getNoteMD(note.id);
      if (md) {
        notesMD.push(md);
      }
    } else if (note.type === "rss") {
      const item = await rssDb.getItemByNoteId(note.id);
      if (item) {
        rssItems.push(item);
      }
    } else if (note.type === "web_clip") {
      const clip = await webClipsDb.getWebClip(note.id);
      if (clip) {
        webClips.push(clip);
      }
    }
  }

  // 全リンクを取得
  const allLinks: Link[] = [];
  for (const note of notes) {
    const links = await linksDb.getLinksByNote(note.id);
    allLinks.push(...links.outgoing);
  }

  // 重複を除去
  const uniqueLinks = Array.from(
    new Map(allLinks.map((link) => [`${link.from_note_id}-${link.to_note_id}`, link])).values()
  );

  return {
    version: "1.0",
    exported_at: now,
    notes,
    notes_md: notesMD,
    tags,
    links: uniqueLinks,
    rss_feeds: feeds,
    rss_items: rssItems,
    web_clips: webClips,
    files,
  };
}
