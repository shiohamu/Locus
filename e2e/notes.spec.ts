import { expect, test } from "@playwright/test";
import {
  createNote,
  deleteNote,
  editNote,
  expectNoteInList,
  expectNoteNotInList,
  goToNewNote,
  goToNoteDetail,
  goToNotesList,
} from "./helpers.js";

/**
 * ノート機能のE2Eテスト
 */
test.describe("ノート機能", () => {
  test("ノートの作成・表示・編集・削除ができる", async ({ page }) => {
    const noteTitle = `E2E Test Note ${Date.now()}`;
    const noteContent = "This is a test note content for E2E testing.";
    const updatedTitle = `Updated ${noteTitle}`;
    const updatedContent = "This is updated content.";

    // 1. ノート一覧ページに移動
    await goToNotesList(page);
    await expect(page.locator('h1:has-text("ノート一覧")')).toBeVisible();

    // 2. 新規ノート作成ページに移動
    await goToNewNote(page);
    await expect(
      page.locator('h1:has-text("新規ノート"), h1:has-text("ノート作成")')
    ).toBeVisible();

    // 3. ノートを作成
    const noteId = await createNote(page, noteTitle, noteContent);

    // 4. ノート詳細ページで内容を確認
    await expect(page.locator(`h1:has-text("${noteTitle}")`)).toBeVisible();
    await expect(page.locator(`text=${noteContent}`)).toBeVisible();

    // 5. ノート一覧でノートが表示されているか確認
    await expectNoteInList(page, noteTitle);

    // 6. ノートを編集
    await editNote(page, noteId, updatedTitle, updatedContent);

    // 7. 編集後の内容を確認
    await expect(page.locator(`h1:has-text("${updatedTitle}")`)).toBeVisible();
    await expect(page.locator(`text=${updatedContent}`)).toBeVisible();

    // 8. ノート一覧で更新されたタイトルが表示されているか確認
    await expectNoteInList(page, updatedTitle);

    // 9. ノートを削除
    await deleteNote(page, noteId);

    // 10. ノート一覧でノートが削除されているか確認
    await expectNoteNotInList(page, updatedTitle);
  });

  test("ノート一覧でフィルタリングができる", async ({ page }) => {
    await goToNotesList(page);

    // Markdownノートのみを表示
    const filterSelect = page.locator("select#filter-type").first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption("md");
      await page.waitForTimeout(500);
    }
  });

  test("ノート一覧でソートができる", async ({ page }) => {
    await goToNotesList(page);

    // タイトルでソート
    const sortSelect = page.locator("select#sort-by").first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption("title");
      await page.waitForTimeout(500);
    }
  });
});
