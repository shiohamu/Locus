/**
 * ノート管理カスタムフック
 *
 * このフックは、ノートの読み込み、保存、削除のロジックを提供します。
 * Svelte 4では、関数ベースのアプローチを使用します。
 */

import {
  getNote,
  getNoteMD,
  getRSSItem,
  getWebClip,
  updateNote,
  updateNoteMD,
  updateRSSItem,
} from "$lib/api";
import type { NoteCore, NoteMD, RSSItem, WebClip } from "$lib/types";
import { nowTimestamp } from "$lib/utils";

export interface NoteData {
  note: NoteCore | null;
  noteMD: NoteMD | null;
  rssItem: RSSItem | null;
  webClip: WebClip | null;
}

/**
 * ノートを読み込む
 */
export async function loadNoteData(noteId: string): Promise<NoteData & { error: unknown | null }> {
  try {
    const note = await getNote(noteId);
    if (!note) {
      return {
        note: null,
        noteMD: null,
        rssItem: null,
        webClip: null,
        error: "ノートが見つかりません",
      };
    }

    let noteMD: NoteMD | null = null;
    let rssItem: RSSItem | null = null;
    let webClip: WebClip | null = null;

    if (note.type === "md") {
      noteMD = await getNoteMD(noteId);
    } else if (note.type === "rss") {
      rssItem = await getRSSItem(noteId);
    } else if (note.type === "web_clip") {
      webClip = await getWebClip(noteId);
    }

    return {
      note,
      noteMD,
      rssItem,
      webClip,
      error: null,
    };
  } catch (e) {
    return {
      note: null,
      noteMD: null,
      rssItem: null,
      webClip: null,
      error: e,
    };
  }
}

/**
 * ノートを保存する
 */
export async function saveNoteData(
  noteId: string,
  note: NoteCore,
  noteMD: NoteMD | null,
  rssItem: RSSItem | null,
  title: string,
  content: string
): Promise<void> {
  const updatedCore: NoteCore = {
    ...note,
    title: title.trim(),
    updated_at: nowTimestamp(),
  };

  // ノートコアを更新
  await updateNote(noteId, updatedCore);

  // ノートタイプに応じてコンテンツを更新
  if (note.type === "md" && noteMD) {
    const updatedMD: NoteMD = {
      ...noteMD,
      content: content,
    };
    await updateNoteMD(noteId, { core: updatedCore, md: updatedMD });
  } else if (note.type === "rss" && rssItem) {
    await updateRSSItem(noteId, content);
  }
  // web_clip の編集は現時点では未対応
}
