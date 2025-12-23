/**
 * Markdown内のリンクを検出するユーティリティ
 */

/**
 * MarkdownコンテンツからノートIDへのリンクを検出する
 *
 * 検出する形式:
 * - `[[note-id]]` - ウィキスタイルリンク
 * - `[text](note-id)` - Markdownリンク（note-idがUUID形式の場合）
 * - `[text](/notes/note-id)` - Markdownリンク（相対パス形式）
 *
 * @param content - Markdownコンテンツ
 * @returns 検出されたノートIDの配列（重複なし）
 */
export function detectNoteLinks(content: string): string[] {
	const noteIds = new Set<string>();

	// UUID形式のパターン（8-4-4-4-12の形式）
	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

	// 1. ウィキスタイルリンク: [[note-id]]
	const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
	let match;
	while ((match = wikiLinkPattern.exec(content)) !== null) {
		const linkText = match[1].trim();
		// UUID形式かどうかをチェック
		if (uuidPattern.test(linkText)) {
			noteIds.add(linkText.toLowerCase());
		}
	}

	// 2. Markdownリンク: [text](note-id) または [text](/notes/note-id)
	const markdownLinkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;
	while ((match = markdownLinkPattern.exec(content)) !== null) {
		const linkUrl = match[2].trim();

		// UUID形式かどうかをチェック
		if (uuidPattern.test(linkUrl)) {
			noteIds.add(linkUrl.toLowerCase());
		}

		// 相対パス形式: /notes/note-id または notes/note-id
		const relativePathPattern = /^(?:\/)?notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
		const pathMatch = linkUrl.match(relativePathPattern);
		if (pathMatch && uuidPattern.test(pathMatch[1])) {
			noteIds.add(pathMatch[1].toLowerCase());
		}
	}

	return Array.from(noteIds);
}

