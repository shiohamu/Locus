import type { Link, NoteCore, NoteMD, Tag } from "@locus/shared";
import JSZip from "jszip";
import * as linksDb from "../../db/links.js";
import * as notesDb from "../../db/notes.js";
import * as notesMDDb from "../../db/notes_md.js";
import * as tagsDb from "../../db/tags.js";

/**
 * ノートのメタデータをYAML frontmatter形式で生成
 */
function generateFrontmatter(
  note: NoteCore,
  tags: Tag[],
  links: { outgoing: Link[]; incoming: Link[] }
): string {
  const frontmatter: Record<string, unknown> = {
    id: note.id,
    title: note.title,
    type: note.type,
    created_at: note.created_at,
    updated_at: note.updated_at,
  };

  if (tags.length > 0) {
    frontmatter.tags = tags.map((t) => t.name);
  }

  if (links.outgoing.length > 0 || links.incoming.length > 0) {
    frontmatter.links = {
      outgoing: links.outgoing.map((l) => l.to_note_id),
      incoming: links.incoming.map((l) => l.from_note_id),
    };
  }

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map((v) => `"${v}"`).join(", ")}]`;
      }
      if (typeof value === "object" && value !== null) {
        return `${key}:\n${Object.entries(value)
          .map(([k, v]) => {
            if (Array.isArray(v)) {
              return `  ${k}: [${v.map((item) => `"${item}"`).join(", ")}]`;
            }
            return `  ${k}: "${v}"`;
          })
          .join("\n")}`;
      }
      return `${key}: ${typeof value === "string" ? `"${value}"` : value}`;
    })
    .join("\n");

  return `---\n${yaml}\n---\n\n`;
}

/**
 * Markdownエクスポートを生成
 */
export async function exportMarkdown(options: {
  type?: string;
  tags?: string[];
  includeFiles?: boolean;
  dateFrom?: number;
  dateTo?: number;
}): Promise<Buffer> {
  const zip = new JSZip();

  // 全ノートを取得
  let notes = await notesDb.listNotes({ limit: 10000 });

  // タイプでフィルタリング
  if (options.type) {
    notes = notes.filter((note) => note.type === options.type);
  }

  // 日付範囲でフィルタリング
  if (options.dateFrom) {
    notes = notes.filter((note) => note.created_at >= options.dateFrom!);
  }
  if (options.dateTo) {
    notes = notes.filter((note) => note.created_at <= options.dateTo!);
  }

  // タグでフィルタリング
  if (options.tags && options.tags.length > 0) {
    const notesWithTags = await notesDb.listNotesByTags({
      tagNames: options.tags,
      type: options.type as "md" | "rss" | "web_clip" | undefined,
      limit: 10000,
    });
    const noteIds = new Set(notesWithTags.map((n) => n.id));
    notes = notes.filter((note) => noteIds.has(note.id));
  }

  // バッチ処理でノートの詳細情報を取得（並列処理）
  const noteDataPromises = notes.map(async (note) => {
    try {
      const [tags, links, noteMD] = await Promise.all([
        tagsDb.getTagsByNote(note.id),
        linksDb.getLinksByNote(note.id),
        note.type === "md" ? notesMDDb.getNoteMD(note.id) : Promise.resolve(null),
      ]);

      let content = "";
      if (noteMD) {
        content = noteMD.content;
      }

      return {
        note,
        tags,
        links,
        content,
      };
    } catch (error) {
      // エラーが発生したノートはスキップ（ログに記録）
      console.error(`Failed to process note ${note.id}:`, error);
      return null;
    }
  });

  const noteDataResults = await Promise.all(noteDataPromises);
  const validNoteData = noteDataResults.filter(
    (data): data is NonNullable<typeof data> => data !== null
  );

  // ZIPに追加
  for (const { note, tags, links, content } of validNoteData) {
    const filename = `${note.id}.md`;
    const frontmatter = generateFrontmatter(note, tags, links);
    const markdown = frontmatter + content;
    zip.file(filename, markdown);
  }

  // ZIPファイルを生成（圧縮レベルを指定可能）
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return Buffer.from(zipBuffer);
}
