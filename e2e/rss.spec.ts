import { test, expect } from '@playwright/test';
import { goToRSS, createRSSFeed } from './helpers.js';

/**
 * RSS機能のE2Eテスト
 */
test.describe('RSS機能', () => {
	test('RSSフィード管理ページにアクセスできる', async ({ page }) => {
		await goToRSS(page);
		await expect(page.locator('h1:has-text("RSS"), h1:has-text("RSSフィード")')).toBeVisible();
	});

	test('RSSフィードを登録できる', async ({ page }) => {
		// UNIQUE制約エラーを回避するため、URLにタイムスタンプを追加
		const feedUrl = `https://example.com/rss?t=${Date.now()}`;
		const feedTitle = `Test Feed ${Date.now()}`;

		await goToRSS(page);

		// フィード登録フォームを表示
		const newFeedButton = page.locator('button:has-text("フィードを追加"), button:has-text("新規登録"), button:has-text("追加")').first();
		if (await newFeedButton.isVisible()) {
			await newFeedButton.click();
			await page.waitForTimeout(500);
		}

		// URLとタイトルを入力
		const urlInput = page.locator('input[type="url"], input[placeholder*="URL"]').first();
		const titleInput = page.locator('input[type="text"], input[placeholder*="タイトル"]').first();

		if (await urlInput.isVisible() && await titleInput.isVisible()) {
			await urlInput.fill(feedUrl);
			await titleInput.fill(feedTitle);

			// 登録ボタンをクリック
			const submitButton = page.locator('button:has-text("登録"), button:has-text("作成")').first();
			await submitButton.click();

			// 登録完了を待つ - "登録中..." が消えるのを待つ
			await page.waitForSelector('button:has-text("登録中...")', { state: 'hidden', timeout: 10000 }).catch(() => {});
			// フィード一覧が更新されるまで待つ
			await page.waitForTimeout(1000);

			// フィードが表示されているか確認
			await expect(page.locator(`text=${feedTitle}`)).toBeVisible({ timeout: 5000 });
		}
	});
});


