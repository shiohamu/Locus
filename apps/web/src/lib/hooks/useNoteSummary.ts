/**
 * ノート要約カスタムフック
 */

import { summarizeNote, summarizeRSSArticle } from "$lib/api";
import type { NoteCore } from "$lib/types";

/**
 * ノートの要約を生成
 */
export async function generateNoteSummary(
  noteId: string,
  noteType: NoteCore["type"]
): Promise<string> {
  let result: { summary: string };

  if (noteType === "rss") {
    result = await summarizeRSSArticle(noteId);
  } else {
    result = await summarizeNote(noteId);
  }

  return result.summary;
}
