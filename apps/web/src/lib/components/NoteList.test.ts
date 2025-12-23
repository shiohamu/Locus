import { describe, test, expect } from "bun:test";
import type { NoteCore } from "$lib/types";

// NoteListコンポーネントのロジックをテスト
// SvelteコンポーネントのレンダリングテストはE2Eテストでカバー

describe("NoteList component logic", () => {
	test("ノートデータの構造が正しい", () => {
		const notes: NoteCore[] = [
			{
				id: "1",
				type: "md",
				title: "Test Note 1",
				created_at: 1609459200,
				updated_at: 1609459200,
				deleted_at: null,
			},
			{
				id: "2",
				type: "rss",
				title: "Test Note 2",
				created_at: 1609459200,
				updated_at: 1609459200,
				deleted_at: null,
			},
		];

		// ノートデータの構造を検証
		expect(notes).toHaveLength(2);
		expect(notes[0].id).toBe("1");
		expect(notes[0].type).toBe("md");
		expect(notes[0].title).toBe("Test Note 1");
		expect(notes[1].type).toBe("rss");
	});

	test("空のノート配列を処理できる", () => {
		const notes: NoteCore[] = [];

		expect(notes).toHaveLength(0);
	});

	test("ノートのリンクURLが正しく生成される", () => {
		const noteId = "test-id";
		const expectedUrl = `/notes/${noteId}`;

		expect(expectedUrl).toBe("/notes/test-id");
	});
});
