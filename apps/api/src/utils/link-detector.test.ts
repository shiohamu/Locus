import { describe, expect, test } from "bun:test";
import { detectNoteLinks } from "./link-detector.js";

describe("link-detector", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";
  const anotherValidUuid = "987fcdeb-51a2-43f7-8c9d-123456789abc";

  test("detectNoteLinks - ウィキスタイルリンクを検出できる", () => {
    const content = `This is a note with a link [[${validUuid}]]`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - 複数のウィキスタイルリンクを検出できる", () => {
    const content = `Link 1: [[${validUuid}]] and Link 2: [[${anotherValidUuid}]]`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links).toContain(anotherValidUuid.toLowerCase());
    expect(links.length).toBe(2);
  });

  test("detectNoteLinks - Markdownリンク（UUID形式）を検出できる", () => {
    const content = `This is a [link](${validUuid})`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - Markdownリンク（相対パス形式）を検出できる", () => {
    const content = `This is a [link](/notes/${validUuid})`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - 相対パス形式（スラッシュなし）を検出できる", () => {
    const content = `This is a [link](notes/${validUuid})`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - 複数の形式のリンクを検出できる", () => {
    const content = `Wiki: [[${validUuid}]] and Markdown: [link](${anotherValidUuid})`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links).toContain(anotherValidUuid.toLowerCase());
    expect(links.length).toBe(2);
  });

  test("detectNoteLinks - 重複するリンクは1つだけ返す", () => {
    const content = `[[${validUuid}]] and [[${validUuid}]]`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - 無効なUUID形式は検出しない", () => {
    const content = `This is not a link: [[invalid-id]]`;
    const links = detectNoteLinks(content);
    expect(links.length).toBe(0);
  });

  test("detectNoteLinks - 空のコンテンツは空配列を返す", () => {
    const links = detectNoteLinks("");
    expect(links.length).toBe(0);
  });

  test("detectNoteLinks - リンクがない場合は空配列を返す", () => {
    const content = "This is just plain text without any links.";
    const links = detectNoteLinks(content);
    expect(links.length).toBe(0);
  });

  test("detectNoteLinks - 大文字小文字を区別せずに検出する", () => {
    const upperUuid = validUuid.toUpperCase();
    const content = `[[${upperUuid}]]`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });

  test("detectNoteLinks - ウィキスタイルリンク内の空白をトリムする", () => {
    const content = `[[ ${validUuid} ]]`;
    const links = detectNoteLinks(content);
    expect(links).toContain(validUuid.toLowerCase());
    expect(links.length).toBe(1);
  });
});

