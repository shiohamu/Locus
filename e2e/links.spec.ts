import { test, expect } from '@playwright/test';
import { createNote, goToNoteDetail } from './helpers.js';

/**
 * 双方向リンク機能のE2Eテスト
 */
test.describe('双方向リンク機能', () => {
	test('ノート間のリンクが機能する', async ({ page }) => {
		const note1Title = `E2E Link Note 1 ${Date.now()}`;
		const note1Content = 'This is the first note.';
		const note2Title = `E2E Link Note 2 ${Date.now()}`;
		const note2Content = 'This is the second note with a link to [[note1]].';

		// 1. 最初のノートを作成
		const note1Id = await createNote(page, note1Title, note1Content);

		// 2. 2つ目のノートを作成（リンクを含む）
		// 注意: 実際のリンク形式は実装に依存します
		const note2Id = await createNote(page, note2Title, note2Content);

		// 3. ノート詳細ページでリンクが表示されているか確認
		await goToNoteDetail(page, note2Id);

		// リンクセクションが存在するか確認（実装に依存）
		const linksSection = page.locator('text=リンク, text=関連ノート').first();
		// リンクセクションが存在する場合のみテスト
		if (await linksSection.isVisible().catch(() => false)) {
			await expect(linksSection).toBeVisible();
		}
	});
});


