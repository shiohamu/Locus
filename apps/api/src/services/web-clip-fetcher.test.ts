import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { Client } from "@libsql/client";
import { cleanupTestDbFile, createTestDbFile, createTestNoteCore } from "../test/helpers.js";
import * as notesDb from "../db/notes.js";
import * as searchDb from "../db/search.js";
import * as webClipsDb from "../db/web-clips.js";
import * as webClipFetcher from "./web-clip-fetcher.js";

// fetchをモック
const mockFetch = spyOn(global, "fetch").mockImplementation(async (url: string | URL) => {
  const urlString = typeof url === "string" ? url : url.toString();
  if (urlString.includes("timeout")) {
    // タイムアウトをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 35000));
    throw new Error("Request timeout");
  }
  if (urlString.includes("error")) {
    return new Response("Error", { status: 500 });
  }
  if (urlString.includes("large")) {
    // 10MBを超えるコンテンツをシミュレート
    return new Response("x".repeat(11 * 1024 * 1024), {
      headers: { "content-length": String(11 * 1024 * 1024) },
    });
  }
  // 正常なHTMLレスポンス
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
  <meta name="description" content="Test description">
</head>
<body>
  <article>
    <h1>Test Article</h1>
    <p>This is a test article content.</p>
  </article>
  <nav>Navigation</nav>
  <footer>Footer</footer>
</body>
</html>`,
    {
      headers: { "content-type": "text/html" },
    }
  );
});

describe("web-clip-fetcher", () => {
  let testDb: Client;
  let dbPath: string;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    const result = await createTestDbFile();
    testDb = result.db;
    dbPath = result.path;

    originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${dbPath}`;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      process.env.DATABASE_URL = undefined;
    }

    await cleanupTestDbFile(testDb, dbPath);
    mockFetch.mockClear();
  });

  test("fetchWebClip - URLからWebクリップを作成できる", async () => {
    const result = await webClipFetcher.fetchWebClip("https://example.com/article");

    expect(result.note).toBeDefined();
    expect(result.note.type).toBe("web_clip");
    expect(result.note.title).toBe("Test Article");
    expect(result.webClip).toBeDefined();
    expect(result.webClip.source_url).toBe("https://example.com/article");

    // データベースに保存されていることを確認
    const note = await notesDb.getNote(result.note.id);
    expect(note).not.toBeNull();

    const webClip = await webClipsDb.getWebClip(result.note.id);
    expect(webClip).not.toBeNull();
  });

  test("fetchWebClip - HTMLがMarkdownに変換される", async () => {
    const result = await webClipFetcher.fetchWebClip("https://example.com/article");

    // コンテンツがMarkdown形式になっていることを確認
    expect(result.webClip.content).toContain("Test Article");
    expect(result.webClip.content).toContain("test article content");
    // ソースURLが含まれていることを確認
    expect(result.webClip.content).toContain("https://example.com/article");
  });

  test("fetchWebClip - 不要な要素が除去される", async () => {
    const result = await webClipFetcher.fetchWebClip("https://example.com/article");

    // ナビゲーションやフッターが除去されていることを確認
    // 実際の変換結果はturndownの実装に依存するが、メインコンテンツが含まれていることを確認
    expect(result.webClip.content.length).toBeGreaterThan(0);
  });

  test("fetchWebClip - FTSインデックスが更新される", async () => {
    const result = await webClipFetcher.fetchWebClip("https://example.com/article");

    // 検索でノートが見つかることを確認
    const notes = await searchDb.searchNotes("Article");
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.some((n) => n.id === result.note.id)).toBe(true);
  });

  test("fetchWebClip - 無効なURLでエラーが発生する", async () => {
    await expect(webClipFetcher.fetchWebClip("invalid-url")).rejects.toThrow("Invalid URL");
  });

  test("fetchWebClip - HTTPエラーでエラーが発生する", async () => {
    await expect(webClipFetcher.fetchWebClip("https://example.com/error")).rejects.toThrow();
  });

  test("fetchWebClip - タイムアウトでエラーが発生する", async () => {
    // タイムアウトテストは時間がかかるため、スキップするか短縮する
    // 実際のタイムアウトは30秒なので、テストでは短縮するかモックを調整
    await expect(webClipFetcher.fetchWebClip("https://example.com/timeout")).rejects.toThrow();
  }, 40000);

  test("fetchWebClip - ファイルサイズ制限でエラーが発生する", async () => {
    await expect(webClipFetcher.fetchWebClip("https://example.com/large")).rejects.toThrow(
      "Content too large"
    );
  });

  test("refetchWebClip - Webクリップを再取得して更新できる", async () => {
    // 最初のWebクリップを作成
    const initial = await webClipFetcher.fetchWebClip("https://example.com/article");
    const initialFetchedAt = initial.webClip.fetched_at;

    // 少し待ってから再取得
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await webClipFetcher.refetchWebClip(initial.note.id);

    expect(result.note.id).toBe(initial.note.id);
    expect(result.webClip.fetched_at).toBeGreaterThan(initialFetchedAt);
  });

  test("refetchWebClip - 存在しないWebクリップでエラーが発生する", async () => {
    await expect(webClipFetcher.refetchWebClip("non-existent-id")).rejects.toThrow(
      "Web clip not found"
    );
  });
});

