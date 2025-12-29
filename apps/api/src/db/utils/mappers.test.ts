import { describe, expect, test } from "bun:test";
import { ValidationError } from "../../utils/errors.js";
import {
  mapRowToNoteCore,
  mapRowToTag,
  mapRowToFile,
  mapRowsToNoteCore,
  mapRowsToTag,
  mapRowsToFile,
} from "./mappers.js";

describe("mappers", () => {
  describe("mapRowToNoteCore", () => {
    test("should map valid row to NoteCore", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      };

      const result = mapRowToNoteCore(row);
      expect(result).toEqual({
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      });
    });

    test("should handle missing public field", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
      };

      const result = mapRowToNoteCore(row);
      expect(result.public).toBe(0);
    });

    test("should throw ValidationError for invalid type", () => {
      const row = {
        id: "test-id",
        type: "invalid",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      };

      expect(() => mapRowToNoteCore(row)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid string field", () => {
      const row = {
        id: 123, // invalid type
        type: "md",
        title: "Test Note",
        created_at: 1000,
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      };

      expect(() => mapRowToNoteCore(row)).toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid number field", () => {
      const row = {
        id: "test-id",
        type: "md",
        title: "Test Note",
        created_at: "invalid", // invalid type
        updated_at: 2000,
        deleted_at: null,
        public: 0,
      };

      expect(() => mapRowToNoteCore(row)).toThrow(ValidationError);
    });
  });

  describe("mapRowToTag", () => {
    test("should map valid row to Tag", () => {
      const row = {
        id: "tag-id",
        name: "test-tag",
      };

      const result = mapRowToTag(row);
      expect(result).toEqual({
        id: "tag-id",
        name: "test-tag",
      });
    });

    test("should throw ValidationError for invalid field", () => {
      const row = {
        id: 123, // invalid type
        name: "test-tag",
      };

      expect(() => mapRowToTag(row)).toThrow(ValidationError);
    });
  });

  describe("mapRowToFile", () => {
    test("should map valid row to File", () => {
      const row = {
        id: "file-id",
        filename: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
        created_at: 1000,
        show_in_notes: 1,
      };

      const result = mapRowToFile(row);
      expect(result).toEqual({
        id: "file-id",
        filename: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
        created_at: 1000,
        show_in_notes: true,
      });
    });

    test("should handle show_in_notes = 0", () => {
      const row = {
        id: "file-id",
        filename: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
        created_at: 1000,
        show_in_notes: 0,
      };

      const result = mapRowToFile(row);
      expect(result.show_in_notes).toBe(false);
    });

    test("should handle show_in_notes = null", () => {
      const row = {
        id: "file-id",
        filename: "test.pdf",
        mime_type: "application/pdf",
        size: 1024,
        created_at: 1000,
        show_in_notes: null,
      };

      const result = mapRowToFile(row);
      expect(result.show_in_notes).toBe(false);
    });
  });

  describe("mapRowsToNoteCore", () => {
    test("should map multiple rows", () => {
      const rows = [
        {
          id: "id1",
          type: "md",
          title: "Note 1",
          created_at: 1000,
          updated_at: 2000,
          deleted_at: null,
          public: 0,
        },
        {
          id: "id2",
          type: "rss",
          title: "Note 2",
          created_at: 2000,
          updated_at: 3000,
          deleted_at: null,
          public: 1,
        },
      ];

      const result = mapRowsToNoteCore(rows);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("id1");
      expect(result[1].id).toBe("id2");
    });
  });

  describe("mapRowsToTag", () => {
    test("should map multiple rows", () => {
      const rows = [
        { id: "tag1", name: "tag1" },
        { id: "tag2", name: "tag2" },
      ];

      const result = mapRowsToTag(rows);
      expect(result).toHaveLength(2);
    });
  });

  describe("mapRowsToFile", () => {
    test("should map multiple rows", () => {
      const rows = [
        {
          id: "file1",
          filename: "file1.pdf",
          mime_type: "application/pdf",
          size: 1024,
          created_at: 1000,
          show_in_notes: 1,
        },
        {
          id: "file2",
          filename: "file2.pdf",
          mime_type: "application/pdf",
          size: 2048,
          created_at: 2000,
          show_in_notes: 0,
        },
      ];

      const result = mapRowsToFile(rows);
      expect(result).toHaveLength(2);
    });
  });
});

