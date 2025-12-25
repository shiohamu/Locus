/**
 * タグ
 */
export interface Tag {
	/** タグID（UUID v4） */
	id: string;
	/** タグ名（一意） */
	name: string;
}

/**
 * ノートとタグの関連
 */
export interface NoteTag {
	/** ノートID */
	note_id: string;
	/** タグID */
	tag_id: string;
}




