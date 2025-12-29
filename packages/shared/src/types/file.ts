/**
 * ファイル
 */
export interface File {
  /** ファイルID（UUID v4） */
  id: string;
  /** ファイル名 */
  filename: string;
  /** MIMEタイプ */
  mime_type: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 作成日時（Unix timestamp、秒単位） */
  created_at: number;
  /** ノート一覧に表示するかどうか */
  show_in_notes: boolean;
}

/**
 * ファイルとノートの関連
 */
export interface FileNote {
  /** ファイルID */
  file_id: string;
  /** ノートID */
  note_id: string;
}
