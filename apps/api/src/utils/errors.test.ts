import { describe, expect, test } from "bun:test";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  ExternalServiceError,
  NotFoundError,
  TimeoutError,
  ValidationError,
  getErrorCode,
  getStatusCode,
  toAppError,
  toErrorResponse,
} from "./errors.js";

describe("errors", () => {
  describe("AppError", () => {
    test("should create AppError with default status code", () => {
      const error = new AppError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });

    test("should create AppError with custom status code and code", () => {
      const error = new AppError("Test error", 404, "NOT_FOUND");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("NotFoundError", () => {
    test("should create NotFoundError with resource name", () => {
      const error = new NotFoundError("Note");
      expect(error.message).toBe("Note not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });

    test("should create NotFoundError with resource name and id", () => {
      const error = new NotFoundError("Note", "123");
      expect(error.message).toBe('Note with id "123" not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("ValidationError", () => {
    test("should create ValidationError", () => {
      const error = new ValidationError("Invalid input");
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DatabaseError", () => {
    test("should create DatabaseError", () => {
      const error = new DatabaseError("Database connection failed");
      expect(error.message).toBe("Database connection failed");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("AuthenticationError", () => {
    test("should create AuthenticationError with default message", () => {
      const error = new AuthenticationError();
      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("AUTHENTICATION_ERROR");
    });

    test("should create AuthenticationError with custom message", () => {
      const error = new AuthenticationError("Custom auth error");
      expect(error.message).toBe("Custom auth error");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("AUTHENTICATION_ERROR");
    });
  });

  describe("AuthorizationError", () => {
    test("should create AuthorizationError with default message", () => {
      const error = new AuthorizationError();
      expect(error.message).toBe("Insufficient permissions");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("AUTHORIZATION_ERROR");
    });

    test("should create AuthorizationError with custom message", () => {
      const error = new AuthorizationError("Custom authz error");
      expect(error.message).toBe("Custom authz error");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("AUTHORIZATION_ERROR");
    });
  });

  describe("TimeoutError", () => {
    test("should create TimeoutError with default message", () => {
      const error = new TimeoutError();
      expect(error.message).toBe("Request timeout");
      expect(error.statusCode).toBe(504);
      expect(error.code).toBe("TIMEOUT_ERROR");
    });

    test("should create TimeoutError with timeoutMs", () => {
      const error = new TimeoutError("Custom timeout", 5000);
      expect(error.message).toBe("Custom timeout");
      expect(error.statusCode).toBe(504);
      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.details).toEqual({ timeoutMs: 5000 });
    });
  });

  describe("ExternalServiceError", () => {
    test("should create ExternalServiceError", () => {
      const error = new ExternalServiceError("LLM", "Connection failed");
      expect(error.message).toBe("External service error (LLM): Connection failed");
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe("EXTERNAL_SERVICE_ERROR");
      expect(error.details).toEqual({
        service: "LLM",
        details: undefined,
      });
    });

    test("should create ExternalServiceError with details", () => {
      const details = { statusCode: 500 };
      const error = new ExternalServiceError("LLM", "Connection failed", details);
      expect(error.message).toBe("External service error (LLM): Connection failed");
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe("EXTERNAL_SERVICE_ERROR");
      expect(error.details).toEqual({
        service: "LLM",
        details,
      });
    });
  });

  describe("toAppError", () => {
    test("should return AppError as is", () => {
      const error = new NotFoundError("Note", "123");
      const result = toAppError(error);
      expect(result).toBe(error);
    });

    test("should convert Error to AppError", () => {
      const error = new Error("Test error");
      const result = toAppError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("Test error");
      expect(result.statusCode).toBe(500);
    });

    test("should detect database errors", () => {
      const error = new Error("SQLITE_ERROR: no such table");
      const result = toAppError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe("DATABASE_ERROR");
    });

    test("should detect timeout errors", () => {
      const error = new Error("Request timeout");
      const result = toAppError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe("TIMEOUT_ERROR");
      expect(result.statusCode).toBe(504);
    });

    test("should handle unknown errors", () => {
      const result = toAppError("Unknown error");
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("Unknown error occurred");
      expect(result.code).toBe("UNKNOWN_ERROR");
    });
  });

  describe("toErrorResponse", () => {
    test("should convert AppError to error response", () => {
      const error = new NotFoundError("Note", "123");
      const response = toErrorResponse(error);
      expect(response.error).toBe('Note with id "123" not found');
      expect(response.code).toBe("NOT_FOUND");
    });

    test("should include stack trace in development", () => {
      const error = new NotFoundError("Note", "123");
      const response = toErrorResponse(error, true);
      expect(response.error).toBe('Note with id "123" not found');
      expect(response.code).toBe("NOT_FOUND");
      expect(response.stack).toBeDefined();
    });

    test("should not include stack trace in production", () => {
      const error = new NotFoundError("Note", "123");
      const response = toErrorResponse(error, false);
      expect(response.error).toBe('Note with id "123" not found');
      expect(response.code).toBe("NOT_FOUND");
      expect(response.stack).toBeUndefined();
    });
  });

  describe("getStatusCode", () => {
    test("should return status code from AppError", () => {
      const error = new NotFoundError("Note", "123");
      expect(getStatusCode(error)).toBe(404);
    });

    test("should return 500 for unknown errors", () => {
      expect(getStatusCode(new Error("Test"))).toBe(500);
    });
  });

  describe("getErrorCode", () => {
    test("should return error code from AppError", () => {
      const error = new NotFoundError("Note", "123");
      expect(getErrorCode(error)).toBe("NOT_FOUND");
    });

    test("should return INTERNAL_ERROR for unknown errors", () => {
      expect(getErrorCode(new Error("Test"))).toBe("INTERNAL_ERROR");
    });
  });
});
