/**
 * 双方向リンク
 */
export interface Link {
  /** リンク元ノートID */
  from_note_id: string;
  /** リンク先ノートID */
  to_note_id: string;
}
