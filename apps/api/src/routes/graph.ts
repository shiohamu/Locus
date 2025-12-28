import type { GraphData, GraphEdge, GraphNode, NoteType } from "@locus/shared";
import { Hono } from "hono";
import * as linksDb from "../db/links.js";
import * as notesDb from "../db/notes.js";
import * as tagsDb from "../db/tags.js";

const app = new Hono();

/**
 * グラフデータを取得
 * GET /graph?type=md&tags=tag1,tag2
 */
app.get("/", async (c) => {
  try {
    // クエリパラメータを取得
    const typeParam = c.req.query("type");
    const tagsParam = c.req.query("tags");
    const limitParam = c.req.query("limit");

    // フィルタリング用のパラメータ
    const type: NoteType | undefined = typeParam as NoteType | undefined;
    const tagNames: string[] = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    // デフォルトで100件に制限（パフォーマンス向上）
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 100;

    console.log(
      `Fetching notes with type=${type || "all"}, tags=${tagNames.join(",") || "none"}, limit=${limit}`
    );

    // タグフィルタがある場合はSQLレベルでフィルタリング、ない場合は通常の取得
    let allNotes: Awaited<ReturnType<typeof notesDb.listNotes>>;
    if (tagNames.length > 0) {
      // SQLレベルでタグフィルタリング（より効率的）
      allNotes = await notesDb.listNotesByTags({ type, tagNames, limit });
      console.log(`Fetched ${allNotes.length} notes with tags: ${tagNames.join(", ")}`);
    } else {
      // タグフィルタがない場合は通常の取得
      allNotes = await notesDb.listNotes({ type, limit });
      console.log(`Fetched ${allNotes.length} notes`);
    }

    // バッチでタグを取得（N+1問題を回避）
    const allTagsMap = new Map<string, string[]>();
    await Promise.all(
      allNotes.map(async (note) => {
        const tags = await tagsDb.getTagsByNote(note.id);
        allTagsMap.set(
          note.id,
          tags.map((t) => t.name)
        );
      })
    );

    // タグフィルタリングは既にSQLレベルで行われているため、ここでは不要
    const filteredNotes = allNotes;

    // フィルタリング後のノードIDセット
    const filteredNoteIds = new Set(filteredNotes.map((n) => n.id));

    const nodes: GraphNode[] = filteredNotes.map((note) => ({
      id: note.id,
      label: note.title,
      type: note.type,
      tags: allTagsMap.get(note.id) || [],
    }));

    // エッジを生成（フィルタリングされたノート間のリンクのみ）
    // バッチでリンクを取得（N+1問題を回避）
    const allLinks: GraphEdge[] = [];
    await Promise.all(
      filteredNotes.map(async (note) => {
        const links = await linksDb.getLinksByNote(note.id);
        // アウトゴーイングリンク（フィルタリング後のノート間のみ）
        for (const link of links.outgoing) {
          // from_note_idとto_note_idの両方がフィルタリング後のノートセットに含まれていることを確認
          if (filteredNoteIds.has(link.from_note_id) && filteredNoteIds.has(link.to_note_id)) {
            allLinks.push({
              from: link.from_note_id,
              to: link.to_note_id,
            });
          }
        }
      })
    );

    // 重複を除去
    const uniqueEdges = Array.from(
      new Map(allLinks.map((edge) => [`${edge.from}-${edge.to}`, edge])).values()
    );

    const graphData: GraphData = {
      nodes,
      edges: uniqueEdges,
    };

    return c.json(graphData);
  } catch (error) {
    console.error("Graph data generation error:", error);
    return c.json({ error: "Failed to generate graph data" }, 500);
  }
});

export default app;
