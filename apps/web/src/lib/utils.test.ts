import { describe, expect, test } from "bun:test";
import { dateToTimestamp, formatDate, generateId, nowTimestamp, timestampToDate } from "./utils.js";

describe("utils", () => {
  test("timestampToDate - Unix timestampをDateオブジェクトに変換できる", () => {
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    const date = timestampToDate(timestamp);

    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBe(timestamp * 1000);
  });

  test("dateToTimestamp - DateオブジェクトをUnix timestampに変換できる", () => {
    const date = new Date("2021-01-01T00:00:00Z");
    const timestamp = dateToTimestamp(date);

    expect(timestamp).toBe(1609459200);
  });

  test("nowTimestamp - 現在のUnix timestampを取得できる", () => {
    const before = Math.floor(Date.now() / 1000);
    const now = nowTimestamp();
    const after = Math.floor(Date.now() / 1000);

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });

  test("generateId - UUID v4を生成できる", () => {
    const id1 = generateId();
    const id2 = generateId();

    // UUID v4の形式をチェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id1).toMatch(uuidRegex);
    expect(id2).toMatch(uuidRegex);
    expect(id1).not.toBe(id2); // 異なるIDが生成される
  });

  test("formatDate - 日時をフォーマットできる", () => {
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    const formatted = formatDate(timestamp);

    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
    // 日本語ロケールでフォーマットされることを確認
    expect(formatted).toContain("2021");
  });

  test("timestampToDateとdateToTimestampが双方向に変換できる", () => {
    const originalTimestamp = 1609459200;
    const date = timestampToDate(originalTimestamp);
    const convertedTimestamp = dateToTimestamp(date);

    expect(convertedTimestamp).toBe(originalTimestamp);
  });
});
