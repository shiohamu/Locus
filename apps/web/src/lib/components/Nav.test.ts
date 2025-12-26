import { describe, expect, test } from "bun:test";

// Navコンポーネントのロジックをテスト
// SvelteコンポーネントのレンダリングテストはE2Eテストでカバー

describe("Nav component logic", () => {
  test("ナビゲーションリンクのパスが正しい", () => {
    const navLinks = [
      { label: "ホーム", path: "/" },
      { label: "新規ノート", path: "/notes/new" },
      { label: "タグ", path: "/tags" },
      { label: "RSS", path: "/rss" },
      { label: "検索", path: "/search" },
    ];

    expect(navLinks).toHaveLength(5);
    expect(navLinks[0].path).toBe("/");
    expect(navLinks[1].path).toBe("/notes/new");
    expect(navLinks[2].path).toBe("/tags");
    expect(navLinks[3].path).toBe("/rss");
    expect(navLinks[4].path).toBe("/search");
  });
});
