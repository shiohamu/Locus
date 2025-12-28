import type { Link, NoteCore, Tag } from "@locus/shared";
import { marked } from "marked";
import * as linksDb from "../../db/links.js";
import * as notesDb from "../../db/notes.js";
import * as notesMDDb from "../../db/notes_md.js";
import * as rssDb from "../../db/rss.js";
import * as tagsDb from "../../db/tags.js";
import * as webClipsDb from "../../db/web-clips.js";

/**
 * HTMLテンプレート（シンプルなWikiスタイル）
 */
function generateHTMLTemplate(
  title: string,
  content: string,
  metadata: {
    created_at: number;
    updated_at: number;
    tags: Tag[];
    links: { outgoing: Link[]; incoming: Link[] };
    type: string;
    metadata?: Record<string, unknown>;
  }
): string {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString("ja-JP");
  };

  const tagList = metadata.tags
    .map((tag) => `<span class="tag">${escapeHtml(tag.name)}</span>`)
    .join("");

  const outgoingLinks = metadata.links.outgoing
    .map((link) => `<li><a href="${link.to_note_id}.html">${escapeHtml(link.to_note_id)}</a></li>`)
    .join("");

  const incomingLinks = metadata.links.incoming
    .map(
      (link) => `<li><a href="${link.from_note_id}.html">${escapeHtml(link.from_note_id)}</a></li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f7fa;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }
    .metadata {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .tags {
      margin: 1rem 0;
    }
    .tag {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .content {
      margin: 2rem 0;
    }
    .content h1, .content h2, .content h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .content p {
      margin-bottom: 1rem;
    }
    .content ul, .content ol {
      margin-left: 2rem;
      margin-bottom: 1rem;
    }
    .content code {
      background: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.875em;
    }
    .content pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    .content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    .links {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    .links h3 {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }
    .links ul {
      list-style: none;
      margin-left: 0;
    }
    .links li {
      margin-bottom: 0.5rem;
    }
    .links a {
      color: #6366f1;
      text-decoration: none;
    }
    .links a:hover {
      text-decoration: underline;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: #6366f1;
      text-decoration: none;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="index.html" class="back-link">← 一覧に戻る</a>
    <h1>${escapeHtml(title)}</h1>
    <div class="metadata">
      <div>作成日時: ${formatDate(metadata.created_at)}</div>
      <div>更新日時: ${formatDate(metadata.updated_at)}</div>
      <div>タイプ: ${escapeHtml(metadata.type)}</div>
      ${metadata.metadata?.url ? `<div>URL: <a href="${escapeHtml(metadata.metadata.url as string)}" target="_blank" rel="noopener noreferrer">${escapeHtml(metadata.metadata.url as string)}</a></div>` : ""}
    </div>
    ${tagList ? `<div class="tags">${tagList}</div>` : ""}
    <div class="content">
      ${content}
    </div>
    ${
      outgoingLinks || incomingLinks
        ? `
    <div class="links">
      ${
        outgoingLinks
          ? `
      <h3>関連ノート</h3>
      <ul>${outgoingLinks}</ul>
      `
          : ""
      }
      ${
        incomingLinks
          ? `
      <h3>参照元</h3>
      <ul>${incomingLinks}</ul>
      `
          : ""
      }
    </div>
    `
        : ""
    }
  </div>
</body>
</html>`;
}

/**
 * インデックスページのHTMLを生成
 */
function generateIndexHTML(notes: NoteCore[]): string {
  const noteList = notes
    .map(
      (note) => `
    <li>
      <a href="${note.id}.html">${escapeHtml(note.title)}</a>
      <span class="note-type">${escapeHtml(note.type)}</span>
    </li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>公開ノート一覧</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f7fa;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }
    ul {
      list-style: none;
    }
    li {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    li:last-child {
      border-bottom: none;
    }
    a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
    .note-type {
      display: inline-block;
      margin-left: 1rem;
      padding: 0.25rem 0.75rem;
      background: #e0e7ff;
      color: #4338ca;
      border-radius: 4px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>公開ノート一覧</h1>
    <ul>
      ${noteList}
    </ul>
  </div>
</body>
</html>`;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 静的HTMLを生成
 */
export async function generateStaticHTML(): Promise<Map<string, string>> {
  const htmlFiles = new Map<string, string>();

  // 公開ノート一覧を取得
  const publicNotes = await notesDb.listPublicNotes({ limit: 10000 });

  // インデックスページを生成
  htmlFiles.set("index.html", generateIndexHTML(publicNotes));

  // 各ノートのHTMLを生成
  for (const note of publicNotes) {
    // コンテンツを取得
    let content = "";
    let metadata: Record<string, unknown> = {};

    if (note.type === "md") {
      const noteMD = await notesMDDb.getNoteMD(note.id);
      if (noteMD) {
        content = await marked.parse(noteMD.content);
      }
    } else if (note.type === "rss") {
      const rssItem = await rssDb.getItemByNoteId(note.id);
      if (rssItem) {
        content = await marked.parse(rssItem.content);
        metadata = {
          url: rssItem.url,
          published_at: rssItem.published_at,
        };
      }
    } else if (note.type === "web_clip") {
      const webClip = await webClipsDb.getWebClip(note.id);
      if (webClip) {
        content = await marked.parse(webClip.content);
        metadata = {
          source_url: webClip.source_url,
          fetched_at: webClip.fetched_at,
        };
      }
    }

    // タグを取得
    const tags = await tagsDb.getTagsByNote(note.id);

    // リンクを取得（公開ノート間のリンクのみ）
    const links = await linksDb.getLinksByNote(note.id);

    const outgoingPublic = await Promise.all(
      links.outgoing.map(async (link) => {
        const targetNote = await notesDb.getNote(link.to_note_id);
        return targetNote?.public === 1 ? link : null;
      })
    );

    const incomingPublic = await Promise.all(
      links.incoming.map(async (link) => {
        const sourceNote = await notesDb.getNote(link.from_note_id);
        return sourceNote?.public === 1 ? link : null;
      })
    );

    const publicLinks = {
      outgoing: outgoingPublic.filter((link): link is typeof link => link !== null),
      incoming: incomingPublic.filter((link): link is typeof link => link !== null),
    };

    // HTMLを生成
    const html = generateHTMLTemplate(note.title, content, {
      created_at: note.created_at,
      updated_at: note.updated_at,
      tags,
      links: publicLinks,
      type: note.type,
      metadata,
    });

    htmlFiles.set(`${note.id}.html`, html);
  }

  return htmlFiles;
}
