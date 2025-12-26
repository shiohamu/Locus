/**
 * Webクリップ
 */
export interface WebClip {
  /** ノートID（notes_core.idと一致） */
  note_id: string;
  /** ソースURL */
  source_url: string;
  /** 取得日時（Unix timestamp、秒単位） */
  fetched_at: number;
  /** コンテンツ（Markdown形式） */
  content: string;
}
