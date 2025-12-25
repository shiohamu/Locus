import { Page, expect } from '@playwright/test';

/**
 * E2Eテスト用のヘルパー関数
 */

/**
 * ノート一覧ページに移動
 */
export async function goToNotesList(page: Page) {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
}

/**
 * 新規ノート作成ページに移動
 */
export async function goToNewNote(page: Page) {
	await page.goto('/notes/new');
	await page.waitForLoadState('networkidle');
}

/**
 * ノート詳細ページに移動
 */
export async function goToNoteDetail(page: Page, noteId: string) {
	await page.goto(`/notes/${noteId}`);
	await page.waitForLoadState('networkidle');
}

/**
 * 検索ページに移動
 */
export async function goToSearch(page: Page) {
	await page.goto('/search');
	await page.waitForLoadState('networkidle');
}

/**
 * RSS管理ページに移動
 */
export async function goToRSS(page: Page) {
	await page.goto('/rss');
	await page.waitForLoadState('networkidle');
}

/**
 * タグ管理ページに移動
 */
export async function goToTags(page: Page) {
	await page.goto('/tags');
	await page.waitForLoadState('networkidle');
}

/**
 * 新規ノートを作成
 */
export async function createNote(
	page: Page,
	title: string,
	content: string,
): Promise<string> {
	await goToNewNote(page);

	// タイトルを入力
	const titleInput = page.locator('#title');
	await titleInput.fill(title);

	// コンテンツを入力
	const contentTextarea = page.locator('#content');
	await contentTextarea.fill(content);

	// 保存ボタンをクリック
	const saveButton = page.locator('button:has-text("保存")').first();
	await saveButton.click();

	// ノート詳細ページに遷移するのを待つ
	await page.waitForURL(/\/notes\/[a-f0-9-]+/, { timeout: 10000 });

	// URLからノートIDを取得
	const url = page.url();
	const match = url.match(/\/notes\/([a-f0-9-]+)/);
	if (!match) {
		throw new Error('ノートIDを取得できませんでした');
	}
	return match[1];
}

/**
 * ノートを編集
 */
export async function editNote(page: Page, noteId: string, newTitle: string, newContent: string) {
	await goToNoteDetail(page, noteId);

	// 編集ボタンをクリック
	const editButton = page.locator('button:has-text("編集")').first();
	if (await editButton.isVisible()) {
		await editButton.click();
		await page.waitForTimeout(500);
	}

	// タイトルを編集
	const titleInput = page.locator('#title');
	await titleInput.clear();
	await titleInput.fill(newTitle);

	// コンテンツを編集
	const contentTextarea = page.locator('#content');
	await contentTextarea.clear();
	await contentTextarea.fill(newContent);

	// 保存ボタンをクリック
	const saveButton = page.locator('button:has-text("保存")').first();
	await saveButton.click();

	// 保存完了を待つ - 編集モードが終了し、ノートが再読み込みされるまで待機
	// "保存中..." が消えるのを待つ
	await page.waitForSelector('button:has-text("保存中...")', { state: 'hidden', timeout: 10000 }).catch(() => {});
	// 編集モードが終了するのを待つ（編集ボタンが再表示されるか、タイトル入力欄が消える）
	await page.waitForSelector('input#title', { state: 'hidden', timeout: 10000 }).catch(() => {});
	// ノート詳細ページに移動し直して、更新された内容を確認
	await goToNoteDetail(page, noteId);
	// 更新されたタイトルが表示されるのを待つ
	await page.waitForSelector(`h1:has-text("${newTitle}")`, { timeout: 10000 });
}

/**
 * ノートを削除
 */
export async function deleteNote(page: Page, noteId: string) {
	await goToNoteDetail(page, noteId);

	// 確認ダイアログを事前に設定
	page.on('dialog', (dialog) => dialog.accept());

	// 削除ボタンをクリック
	const deleteButton = page.locator('button:has-text("削除")').first();
	await deleteButton.click();

	// ノート一覧ページに戻るのを待つ
	await page.waitForURL('/', { timeout: 10000 });
}

/**
 * ノートにタグを追加
 * 注意: タグは事前に作成されている必要があります
 */
export async function addTagToNote(page: Page, noteId: string, tagName: string) {
	await goToNoteDetail(page, noteId);

	// 「+ タグを追加」ボタンをクリック
	const addTagButton = page.locator('button:has-text("+ タグを追加"), button:has-text("タグを追加")').first();
	if (await addTagButton.isVisible()) {
		await addTagButton.click();
		await page.waitForTimeout(500);
	}

	// タグを選択（セレクトボックスから）
	const tagSelect = page.locator('select.tag-select').first();
	if (await tagSelect.isVisible()) {
		// タグ名でオプションを選択
		await tagSelect.selectOption({ label: tagName });
		await page.waitForTimeout(300);

		// 追加ボタンをクリック
		const addButton = page.locator('button:has-text("追加")').first();
		await addButton.click();
	}

	// タグが追加されるのを待つ
	await page.waitForTimeout(1000);
}

/**
 * ノートからタグを削除
 */
export async function removeTagFromNote(page: Page, noteId: string, tagName: string) {
	await goToNoteDetail(page, noteId);

	// タグの削除ボタン（×）をクリック
	// タグ名を含むタグアイテム内の削除ボタンを探す
	const tagItem = page.locator(`.tag-item:has-text("${tagName}")`).first();
	if (await tagItem.isVisible()) {
		const removeButton = tagItem.locator('.remove-btn, button').last();
		await removeButton.click();
	}

	// タグが削除されるのを待つ
	await page.waitForTimeout(1000);
}

/**
 * 検索を実行
 */
export async function searchNotes(page: Page, query: string) {
	await goToSearch(page);

	// 検索入力欄に入力
	const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input.search-input, input[type="text"]').first();
	await searchInput.fill(query);

	// Enterキーを押すか検索ボタンをクリック
	await searchInput.press('Enter');

	// 検索が完了するまで待つ - "検索中..." が消えるのを待つ
	await page.waitForSelector('button:has-text("検索中...")', { state: 'hidden', timeout: 15000 }).catch(() => {});
	// 検索結果が表示されるまで待つ（結果リストまたは「検索結果が見つかりませんでした」メッセージが表示されるまで）
	// hasSearched && !loading の条件で結果が表示されるため、結果リストまたはno-resultsメッセージが表示されるまで待つ
	await page.waitForSelector('.results-list, .no-results, .results-count', { timeout: 15000 });
	// 検索結果が表示されるまで少し待つ
	await page.waitForTimeout(1000);
}

/**
 * RSSフィードを登録
 */
export async function createRSSFeed(page: Page, url: string, title: string) {
	await goToRSS(page);

	// 新規登録フォームを表示
	const newFeedButton = page.locator('button:has-text("新規登録"), button:has-text("追加")').first();
	if (await newFeedButton.isVisible()) {
		await newFeedButton.click();
	}

	// URLを入力
	const urlInput = page.locator('input[type="url"], input[placeholder*="URL"]').first();
	await urlInput.fill(url);

	// タイトルを入力
	const titleInput = page.locator('input[type="text"], input[placeholder*="タイトル"]').first();
	await titleInput.fill(title);

	// 登録ボタンをクリック
	const submitButton = page.locator('button:has-text("登録"), button:has-text("作成")').first();
	await submitButton.click();

	// 登録完了を待つ
	await page.waitForTimeout(1000);
}

/**
 * ノート一覧でノートが表示されているか確認
 */
export async function expectNoteInList(page: Page, title: string) {
	await goToNotesList(page);
	const noteLink = page.locator(`a:has-text("${title}")`).first();
	await expect(noteLink).toBeVisible();
}

/**
 * ノート一覧でノートが表示されていないか確認
 */
export async function expectNoteNotInList(page: Page, title: string) {
	await goToNotesList(page);
	const noteLink = page.locator(`a:has-text("${title}")`).first();
	await expect(noteLink).not.toBeVisible();
}

