import { describe, expect, test } from "bun:test";
import { ValidationError } from "../../utils/errors.js";
import {
	assertLinkRow,
	assertLLMConfig,
	assertLLMProvider,
	assertNoteCoreRow,
	assertNoteMDRow,
	assertNoteType,
	assertNumber,
	assertNumberOrNull,
	assertRSSFeedRow,
	assertRSSItemRow,
	assertString,
	assertWebClipRow,
} from "./validators.js";

describe("validators", () => {
	describe("assertString", () => {
		test("should return string for valid string", () => {
			expect(assertString("test", "field")).toBe("test");
			expect(assertString("", "field")).toBe("");
		});

		test("should throw ValidationError for non-string", () => {
			expect(() => assertString(123, "field")).toThrow(ValidationError);
			expect(() => assertString(null, "field")).toThrow(ValidationError);
			expect(() => assertString(undefined, "field")).toThrow(ValidationError);
		});
	});

	describe("assertNumber", () => {
		test("should return number for valid number", () => {
			expect(assertNumber(123, "field")).toBe(123);
			expect(assertNumber(0, "field")).toBe(0);
			expect(assertNumber(-1, "field")).toBe(-1);
		});

		test("should throw ValidationError for non-number", () => {
			expect(() => assertNumber("123", "field")).toThrow(ValidationError);
			expect(() => assertNumber(null, "field")).toThrow(ValidationError);
			expect(() => assertNumber(undefined, "field")).toThrow(ValidationError);
		});
	});

	describe("assertNumberOrNull", () => {
		test("should return number for valid number", () => {
			expect(assertNumberOrNull(123, "field")).toBe(123);
			expect(assertNumberOrNull(0, "field")).toBe(0);
		});

		test("should return null for null", () => {
			expect(assertNumberOrNull(null, "field")).toBe(null);
		});

		test("should throw ValidationError for non-number and non-null", () => {
			expect(() => assertNumberOrNull("123", "field")).toThrow(ValidationError);
			expect(() => assertNumberOrNull(undefined, "field")).toThrow(ValidationError);
		});
	});

	describe("assertNoteType", () => {
		test("should return NoteType for valid NoteType", () => {
			expect(assertNoteType("md", "field")).toBe("md");
			expect(assertNoteType("rss", "field")).toBe("rss");
			expect(assertNoteType("web_clip", "field")).toBe("web_clip");
		});

		test("should throw ValidationError for invalid NoteType", () => {
			expect(() => assertNoteType("invalid", "field")).toThrow(ValidationError);
			expect(() => assertNoteType("", "field")).toThrow(ValidationError);
			expect(() => assertNoteType(null, "field")).toThrow(ValidationError);
		});
	});

	describe("assertNoteCoreRow", () => {
		test("should return row for valid NoteCore row", () => {
			const row = {
				id: "test-id",
				type: "md",
				title: "Test Note",
				created_at: 1000,
				updated_at: 2000,
				deleted_at: null,
				public: 0,
			};
			expect(assertNoteCoreRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid NoteCore row", () => {
			expect(() => assertNoteCoreRow({})).toThrow(ValidationError);
			expect(() => assertNoteCoreRow({ id: "test-id" })).toThrow(ValidationError);
		});
	});

	describe("assertLinkRow", () => {
		test("should return row for valid Link row", () => {
			const row = {
				from_note_id: "note-1",
				to_note_id: "note-2",
			};
			expect(assertLinkRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid Link row", () => {
			expect(() => assertLinkRow({})).toThrow(ValidationError);
			expect(() => assertLinkRow({ from_note_id: "note-1" })).toThrow(ValidationError);
		});
	});

	describe("assertNoteMDRow", () => {
		test("should return row for valid NoteMD row", () => {
			const row = {
				note_id: "note-id",
				content: "content",
			};
			expect(assertNoteMDRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid NoteMD row", () => {
			expect(() => assertNoteMDRow({})).toThrow(ValidationError);
			expect(() => assertNoteMDRow({ note_id: "note-id" })).toThrow(ValidationError);
		});
	});

	describe("assertRSSFeedRow", () => {
		test("should return row for valid RSSFeed row", () => {
			const row = {
				id: "feed-id",
				url: "https://example.com/feed",
				title: "Test Feed",
				last_fetched_at: 1000,
			};
			expect(assertRSSFeedRow(row)).toEqual(row);
		});

		test("should return row for RSSFeed row with null last_fetched_at", () => {
			const row = {
				id: "feed-id",
				url: "https://example.com/feed",
				title: "Test Feed",
				last_fetched_at: null,
			};
			expect(assertRSSFeedRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid RSSFeed row", () => {
			expect(() => assertRSSFeedRow({})).toThrow(ValidationError);
			expect(() => assertRSSFeedRow({ id: "feed-id" })).toThrow(ValidationError);
		});
	});

	describe("assertRSSItemRow", () => {
		test("should return row for valid RSSItem row", () => {
			const row = {
				note_id: "note-id",
				feed_id: "feed-id",
				url: "https://example.com/item",
				content: "content",
				published_at: 1000,
			};
			expect(assertRSSItemRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid RSSItem row", () => {
			expect(() => assertRSSItemRow({})).toThrow(ValidationError);
			expect(() => assertRSSItemRow({ note_id: "note-id" })).toThrow(ValidationError);
		});
	});

	describe("assertWebClipRow", () => {
		test("should return row for valid WebClip row", () => {
			const row = {
				note_id: "note-id",
				source_url: "https://example.com",
				fetched_at: 1000,
				content: "content",
			};
			expect(assertWebClipRow(row)).toEqual(row);
		});

		test("should throw ValidationError for invalid WebClip row", () => {
			expect(() => assertWebClipRow({})).toThrow(ValidationError);
			expect(() => assertWebClipRow({ note_id: "note-id" })).toThrow(ValidationError);
		});
	});

	describe("assertLLMProvider", () => {
		test("should return LLMProvider for valid provider", () => {
			expect(assertLLMProvider("openai", "field")).toBe("openai");
			expect(assertLLMProvider("openai-compatible", "field")).toBe("openai-compatible");
			expect(assertLLMProvider("ollama", "field")).toBe("ollama");
		});

		test("should throw ValidationError for invalid provider", () => {
			expect(() => assertLLMProvider("invalid", "field")).toThrow(ValidationError);
			expect(() => assertLLMProvider("", "field")).toThrow(ValidationError);
			expect(() => assertLLMProvider(null, "field")).toThrow(ValidationError);
		});
	});

	describe("assertLLMConfig", () => {
		test("should return LLMConfig for valid config with required fields", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
			};
			const result = assertLLMConfig(config);
			expect(result.provider).toBe("openai");
			expect(result.model).toBe("gpt-4");
		});

		test("should return LLMConfig for valid config with optional fields", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
				apiKey: "key",
				baseUrl: "https://api.openai.com",
				maxTokens: 1000,
				temperature: 0.7,
			};
			const result = assertLLMConfig(config);
			expect(result.provider).toBe("openai");
			expect(result.model).toBe("gpt-4");
			expect(result.apiKey).toBe("key");
			expect(result.baseUrl).toBe("https://api.openai.com");
			expect(result.maxTokens).toBe(1000);
			expect(result.temperature).toBe(0.7);
		});

		test("should throw ValidationError for non-object", () => {
			expect(() => assertLLMConfig(null)).toThrow(ValidationError);
			expect(() => assertLLMConfig("invalid")).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid provider", () => {
			const config = {
				provider: "invalid",
				model: "gpt-4",
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid model", () => {
			const config = {
				provider: "openai",
				model: 123,
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid apiKey", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
				apiKey: 123,
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid baseUrl", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
				baseUrl: 123,
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid maxTokens", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
				maxTokens: "invalid",
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});

		test("should throw ValidationError for invalid temperature", () => {
			const config = {
				provider: "openai",
				model: "gpt-4",
				temperature: "invalid",
			};
			expect(() => assertLLMConfig(config)).toThrow(ValidationError);
		});
	});
});

