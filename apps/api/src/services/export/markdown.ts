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
}): Promise<Buffer> {
  const zip = new JSZip();

  // 全ノートを取得
  const allNotes = await notesDb.listNotes({ limit: 10000 });
  let notes = allNotes;

  // タイプでフィルタリング
  if (options.type) {
    notes = notes.filter((note) => note.type === options.type);
  }

  // タグでフィルタリング（将来的に実装）
  // 現時点では全ノートをエクスポート

  // 各ノートを処理
  for (const note of notes) {
    // タグを取得
    const tags = await tagsDb.getTagsByNote(note.id);

    // リンクを取得
    const links = await linksDb.getLinksByNote(note.id);

    // コンテンツを取得
    let content = "";
    if (note.type === "md") {
      const noteMD = await notesMDDb.getNoteMD(note.id);
      if (noteMD) {
        content = noteMD.content;
      }
    }

    // ファイル名を生成（タイトルをサニタイズ）
    const safeTitle = note.title.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);
    const filename = `${note.id}.md`;

    // Markdownを生成
    const frontmatter = generateFrontmatter(note, tags, links);
    const markdown = frontmatter + content;

    // ZIPに追加
    zip.file(filename, markdown);
  }

  // ZIPファイルを生成
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return Buffer.from(zipBuffer);
}
