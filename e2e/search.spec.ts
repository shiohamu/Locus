import { test, expect } from '@playwright/test';
import { createNote, searchNotes, goToSearch } from './helpers.js';

/**
 * 検索機能のE2Eテスト
 */
test.describe('検索機能', () => {
	test('全文検索が機能する', async ({ page }) => {
		const noteTitle = `E2E Search Test Note ${Date.now()}`;
		const noteContent = 'This is a test note with unique keyword: E2E_SEARCH_KEYWORD_12345';

		// 1. ノートを作成
		await createNote(page, noteTitle, noteContent);

		// 2. 検索ページに移動
		await goToSearch(page);

		// 3. 検索を実行
		await searchNotes(page, 'E2E_SEARCH_KEYWORD_12345');

		// 4. 検索結果にノートが表示されているか確認
		await expect(page.locator(`text=${noteTitle}`)).toBeVisible();
	});

	test('タイトルで検索ができる', async ({ page }) => {
		const uniqueTitle = `UniqueTitle_${Date.now()}`;
		const noteContent = 'Test content';

		// 1. ノートを作成
		await createNote(page, uniqueTitle, noteContent);

		// 2. 検索を実行
		await searchNotes(page, uniqueTitle);

		// 3. 検索結果にノートが表示されているか確認
		await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
	});
});


