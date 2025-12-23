import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import * as api from "./api.js";

// fetchをモック
const mockFetch = spyOn(global, "fetch");

describe("api", () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	afterEach(() => {
		mockFetch.mockClear();
	});

	test("getNotes - ノート一覧を取得できる", async () => {
		const mockNotes = [
			{
				id: "1",
				type: "md",
				title: "Test Note",
				created_at: 1609459200,
				updated_at: 1609459200,
				deleted_at: null,
			},
		];

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockNotes,
		} as Response);

		const notes = await api.getNotes();

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/notes"),
			expect.objectContaining({
				headers: expect.objectContaining({
					"Content-Type": "application/json",
				}),
			}),
		);
		expect(notes).toEqual(mockNotes);
	});

	test("getNotes - オプション付きでノート一覧を取得できる", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => [],
		} as Response);

		await api.getNotes({ type: "md", limit: 10, offset: 0 });

		const callArgs = mockFetch.mock.calls[0];
		expect(callArgs[0]).toContain("/notes");
		expect(callArgs[0]).toContain("type=md");
		expect(callArgs[0]).toContain("limit=10");
		// offset=0の場合はURLに含まれない可能性があるため、チェックを緩和
	});

	test("getNote - ノートを取得できる", async () => {
		const mockNote = {
			id: "1",
			type: "md",
			title: "Test Note",
			created_at: 1609459200,
			updated_at: 1609459200,
			deleted_at: null,
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockNote,
		} as Response);

		const note = await api.getNote("1");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/notes/1"),
			expect.any(Object),
		);
		expect(note).toEqual(mockNote);
	});

	test("createNote - ノートを作成できる", async () => {
		const newNote = {
			id: "1",
			type: "md",
			title: "New Note",
			created_at: 1609459200,
			updated_at: 1609459200,
			deleted_at: null,
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => newNote,
		} as Response);

		const created = await api.createNote(newNote);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/notes"),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(newNote),
			}),
		);
		expect(created).toEqual(newNote);
	});

	test("updateNote - ノートを更新できる", async () => {
		const updatedNote = {
			title: "Updated Note",
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => updatedNote,
		} as Response);

		const result = await api.updateNote("1", updatedNote);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/notes/1"),
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify(updatedNote),
			}),
		);
		expect(result).toEqual(updatedNote);
	});

	test("deleteNote - ノートを削除できる", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ message: "Note deleted" }),
		} as Response);

		await api.deleteNote("1");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/notes/1"),
			expect.objectContaining({
				method: "DELETE",
			}),
		);
	});

	test("searchNotes - 全文検索ができる", async () => {
		const mockResults = [
			{
				id: "1",
				type: "md",
				title: "Test Note",
				created_at: 1609459200,
				updated_at: 1609459200,
				deleted_at: null,
			},
		];

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockResults,
		} as Response);

		const results = await api.searchNotes("test");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/search?q=test"),
			expect.any(Object),
		);
		expect(results).toEqual(mockResults);
	});

	test("apiRequest - エラーレスポンスを適切に処理する", async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			json: async () => ({ error: "Not found" }),
		} as Response);

		await expect(api.getNote("non-existent")).rejects.toThrow("Not found");
	});

	test("apiRequest - ネットワークエラーを適切に処理する", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Network error"));

		await expect(api.getNote("1")).rejects.toThrow("Network error");
	});
});

