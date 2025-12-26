/**
 * ノートタイプ
 */
export type NoteType = "md" | "rss";

/**
 * ノートコア情報
 */
export interface NoteCore {
  /** ノートID（UUID v4） */
  id: string;
  /** ノートタイプ */
  type: NoteType;
  /** タイトル */
  title: string;
  /** 作成日時（Unix timestamp、秒単位） */
  created_at: number;
  /** 更新日時（Unix timestamp、秒単位） */
  updated_at: number;
  /** 削除日時（Unix timestamp、秒単位、削除されていない場合はnull） */
  deleted_at: number | null;
}

/**
 * Markdownノート
 */
export interface NoteMD {
  /** ノートID（notes_core.idと一致） */
  note_id: string;
  /** Markdownコンテンツ */
  content: string;
}
