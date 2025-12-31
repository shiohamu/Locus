import { describe, expect, test } from "bun:test";
import { DatabaseError, NotFoundError, ValidationError } from "../../utils/errors.js";
import { handleDbOperation, handleDbOperationNullable } from "./error-handler.js";

describe("error-handler", () => {
  describe("handleDbOperation", () => {
    test("should return result for successful operation", async () => {
      const result = await handleDbOperation("test operation", async () => {
        return "success";
      });
      expect(result).toBe("success");
    });

    test("should throw DatabaseError for database error", async () => {
      const originalError = new Error("SQLITE_ERROR: no such table");
      await expect(
        handleDbOperation("test operation", async () => {
          throw originalError;
        })
      ).rejects.toThrow(DatabaseError);
    });

    test("should rethrow DatabaseError without wrapping", async () => {
      const dbError = new DatabaseError("Database error", {
        originalError: "test",
      });
      await expect(
        handleDbOperation("test operation", async () => {
          throw dbError;
        })
      ).rejects.toThrow(DatabaseError);
    });

    test("should rethrow NotFoundError without wrapping", async () => {
      const notFoundError = new NotFoundError("Not found");
      await expect(
        handleDbOperation("test operation", async () => {
          throw notFoundError;
        })
      ).rejects.toThrow(NotFoundError);
    });

    test("should rethrow ValidationError without wrapping", async () => {
      const validationError = new ValidationError("Validation error");
      await expect(
        handleDbOperation("test operation", async () => {
          throw validationError;
        })
      ).rejects.toThrow(ValidationError);
    });

    test("should wrap generic error as DatabaseError", async () => {
      const genericError = new Error("Generic error");
      await expect(
        handleDbOperation("test operation", async () => {
          throw genericError;
        })
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe("handleDbOperationNullable", () => {
    test("should return result for successful operation", async () => {
      const result = await handleDbOperationNullable("test operation", async () => {
        return "success";
      });
      expect(result).toBe("success");
    });

    test("should return null for nullable operation", async () => {
      const result = await handleDbOperationNullable("test operation", async () => {
        return null;
      });
      expect(result).toBeNull();
    });

    test("should throw DatabaseError for database error", async () => {
      const originalError = new Error("SQLITE_ERROR: no such table");
      await expect(
        handleDbOperationNullable("test operation", async () => {
          throw originalError;
        })
      ).rejects.toThrow(DatabaseError);
    });
  });
});
