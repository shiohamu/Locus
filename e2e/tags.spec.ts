import { expect, test } from "@playwright/test";
import {
  addTagToNote,
  createNote,
  goToNoteDetail,
  goToTags,
  removeTagFromNote,
} from "./helpers.js";

/**
 * タグ機能のE2Eテスト
 */
test.describe("タグ機能", () => {
  test("タグを作成し、ノートに追加・削除できる", async ({ page }) => {
    const tagName = `e2e-test-tag-${Date.now()}`;
    const noteTitle = `E2E Tag Test Note ${Date.now()}`;
    const noteContent = "This is a test note for tag functionality.";

    // 1. タグ管理ページでタグを作成
    await goToTags(page);
    const tagInput = page.locator('input[placeholder*="タグ名"]').first();
    await tagInput.fill(tagName);
    const createButton = page.locator('button:has-text("作成")').first();
    await createButton.click();
    await page.waitForTimeout(1000);

    // 2. ノートを作成
    const noteId = await createNote(page, noteTitle, noteContent);

    // 3. ノート詳細ページでタグを追加
    await addTagToNote(page, noteId, tagName);

    // 4. タグが表示されているか確認
    await expect(page.locator(`.tag-item:has-text("${tagName}")`).first()).toBeVisible();

    // 5. タグを削除
    await removeTagFromNote(page, noteId, tagName);

    // 6. タグが削除されているか確認
    await expect(page.locator(`.tag-item:has-text("${tagName}")`).first()).not.toBeVisible();
  });

  test("タグ管理ページでタグ一覧を表示できる", async ({ page }) => {
    await goToTags(page);
    await expect(page.locator('h1:has-text("タグ"), h1:has-text("タグ一覧")')).toBeVisible();
  });
});
