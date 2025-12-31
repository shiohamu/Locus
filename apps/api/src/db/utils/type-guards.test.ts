import { describe, expect, test } from "bun:test";
import {
  isFileRow,
  isLinkRow,
  isNoteCoreRow,
  isNoteMDRow,
  isNoteType,
  isNull,
  isNumber,
  isObject,
  isRSSFeedRow,
  isRSSItemRow,
  isString,
  isTagRow,
  isWebClipRow,
} from "./type-guards.js";

describe("type-guards", () => {
  describe("isString", () => {
    test("should return true for string", () => {
      expect(isString("test")).toBe(true);
      expect(isString("")).toBe(true);
    });

    test("should return false for non-string", () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });
  });

  describe("isNumber", () => {
    test("should return true for number", () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(1.5)).toBe(true);
    });

    test("should return false for non-number", () => {
      expect(isNumber("123")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
    });
  });

  describe("isNull", () => {
    test("should return true for null", () => {
      expect(isNull(null)).toBe(true);
    });

    test("should return false for non-null", () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull("")).toBe(false);
      expect(isNull({})).toBe(false);
    });
  });

  describe("isObject", () => {
    test("should return true for object", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
    });

    test("should return false for non-object", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
    });
  });

  describe("isNoteType", () => {
    test("should return true for valid NoteType", () => {
      expect(isNoteType("md")).toBe(true);
      expect(isNoteType("rss")).toBe(true);
      expect(isNoteType("web_clip")).toBe(true);
    });

    test("should return false for invalid NoteType", () => {
      expect(isNoteType("invalid")).toBe(false);
      expect(isNoteType("")).toBe(false);
      expect(isNoteType(null)).toBe(false);
      expect(isNoteType(123)).toBe(false);
    });
  });

  describe("isNoteCoreRow", () => {
    test("should return true for valid NoteCore row", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      };
      expect(isNoteCoreRow(row)).toBe(true);
    });

    test("should return true for NoteCore row without public field", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
      };
      expect(isNoteCoreRow(row)).toBe(true);
    });

    test("should return true for NoteCore row with deleted_at as number", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: 3000,
        public: 0,
      };
      expect(isNoteCoreRow(row)).toBe(true);
    });

    test("should return false for invalid NoteCore row - missing id", () => {
      const row = {
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
      };
      expect(isNoteCoreRow(row)).toBe(false);
    });

    test("should return false for invalid NoteCore row - invalid type", () => {
      const row = {
        id: "test-id",
        type: "invalid",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
      };
      expect(isNoteCoreRow(row)).toBe(false);
    });

    test("should return false for invalid NoteCore row - invalid deleted_at", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: "invalid",
      };
      expect(isNoteCoreRow(row)).toBe(false);
    });
  });

  describe("isTagRow", () => {
    test("should return true for valid Tag row", () => {
      const row = {
        id: "tag-id",
        name: "tag-name",
      };
      expect(isTagRow(row)).toBe(true);
    });

    test("should return false for invalid Tag row", () => {
      expect(isTagRow({ id: "tag-id" })).toBe(false);
      expect(isTagRow({ name: "tag-name" })).toBe(false);
      expect(isTagRow({})).toBe(false);
    });
  });

  describe("isFileRow", () => {
    test("should return true for valid File row", () => {
      const row = {
        id: "file-id",
        filename: "test.txt",
        mime_type: "text/plain",
        size: 100,
        created_at: 1000,
        show_in_notes: 1,
      };
      expect(isFileRow(row)).toBe(true);
    });

    test("should return true for File row with null show_in_notes", () => {
      const row = {
        id: "file-id",
        filename: "test.txt",
        mime_type: "text/plain",
        size: 100,
        created_at: 1000,
        show_in_notes: null,
      };
      expect(isFileRow(row)).toBe(true);
    });

    test("should return false for invalid File row", () => {
      expect(isFileRow({})).toBe(false);
      expect(isFileRow({ id: "file-id" })).toBe(false);
    });
  });

  describe("isRSSFeedRow", () => {
    test("should return true for valid RSSFeed row", () => {
      const row = {
        id: "feed-id",
        url: "https://example.com/feed",
        title: "Test Feed",
        last_fetched_at: 1000,
      };
      expect(isRSSFeedRow(row)).toBe(true);
    });

    test("should return true for RSSFeed row with null last_fetched_at", () => {
      const row = {
        id: "feed-id",
        url: "https://example.com/feed",
        title: "Test Feed",
        last_fetched_at: null,
      };
      expect(isRSSFeedRow(row)).toBe(true);
    });

    test("should return false for invalid RSSFeed row", () => {
      expect(isRSSFeedRow({})).toBe(false);
      expect(isRSSFeedRow({ id: "feed-id" })).toBe(false);
    });
  });

  describe("isRSSItemRow", () => {
    test("should return true for valid RSSItem row", () => {
      const row = {
        note_id: "note-id",
        feed_id: "feed-id",
        url: "https://example.com/item",
        content: "content",
        published_at: 1000,
      };
      expect(isRSSItemRow(row)).toBe(true);
    });

    test("should return false for invalid RSSItem row", () => {
      expect(isRSSItemRow({})).toBe(false);
      expect(isRSSItemRow({ note_id: "note-id" })).toBe(false);
    });
  });

  describe("isWebClipRow", () => {
    test("should return true for valid WebClip row", () => {
      const row = {
        note_id: "note-id",
        source_url: "https://example.com",
        fetched_at: 1000,
        content: "content",
      };
      expect(isWebClipRow(row)).toBe(true);
    });

    test("should return false for invalid WebClip row", () => {
      expect(isWebClipRow({})).toBe(false);
      expect(isWebClipRow({ note_id: "note-id" })).toBe(false);
    });
  });

  describe("isLinkRow", () => {
    test("should return true for valid Link row", () => {
      const row = {
        from_note_id: "note-1",
        to_note_id: "note-2",
      };
      expect(isLinkRow(row)).toBe(true);
    });

    test("should return false for invalid Link row", () => {
      expect(isLinkRow({})).toBe(false);
      expect(isLinkRow({ from_note_id: "note-1" })).toBe(false);
    });
  });

  describe("isNoteMDRow", () => {
    test("should return true for valid NoteMD row", () => {
      const row = {
        note_id: "note-id",
        content: "content",
      };
      expect(isNoteMDRow(row)).toBe(true);
    });

    test("should return false for invalid NoteMD row", () => {
      expect(isNoteMDRow({})).toBe(false);
      expect(isNoteMDRow({ note_id: "note-id" })).toBe(false);
    });
  });
});
