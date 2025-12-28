import { describe, expect, test } from "bun:test";
import { getErrorMessage, getErrorType, handleApiError } from "./error-handling.js";

describe("error-handling", () => {
  test("handleApiError - Errorオブジェクトを処理できる", () => {
    const error = new Error("Test error message");
    const result = handleApiError(error);

    expect(result).toBe("Test error message");
  });

  test("handleApiError - 文字列エラーを処理できる", () => {
    const error = "String error message";
    const result = handleApiError(error);

    expect(result).toBe("String error message");
  });

  test("handleApiError - unknown型のエラーをデフォルトメッセージで処理できる", () => {
    const error = { someProperty: "value" };
    const result = handleApiError(error);

    expect(result).toBe("エラーが発生しました");
  });

  test("handleApiError - カスタムデフォルトメッセージを使用できる", () => {
    const error = { someProperty: "value" };
    const defaultMessage = "Custom error message";
    const result = handleApiError(error, defaultMessage);

    expect(result).toBe(defaultMessage);
  });

  test("getErrorMessage - エラーメッセージを取得できる", () => {
    const error = new Error("Test error");
    const result = getErrorMessage(error);

    expect(result).toBe("Test error");
  });

  test("getErrorType - ネットワークエラーを判定できる", () => {
    const error = new Error("Network error occurred");
    const result = getErrorType(error);

    expect(result).toBe("network");
  });

  test("getErrorType - バリデーションエラーを判定できる", () => {
    const error = new Error("Invalid input validation");
    const result = getErrorType(error);

    expect(result).toBe("validation");
  });

  test("getErrorType - APIエラーを判定できる", () => {
    const error = new Error("API HTTP 404 error");
    const result = getErrorType(error);

    expect(result).toBe("api");
  });

  test("getErrorType - 不明なエラーを判定できる", () => {
    const error = new Error("Some other error");
    const result = getErrorType(error);

    expect(result).toBe("unknown");
  });

  test("getErrorType - Errorオブジェクトでない場合はunknownを返す", () => {
    const error = "String error";
    const result = getErrorType(error);

    expect(result).toBe("unknown");
  });
});
