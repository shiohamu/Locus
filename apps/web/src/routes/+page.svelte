<script lang="ts">
import { afterNavigate } from "$app/navigation";
import { deleteNotesBatch } from "$lib/api";
import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
import NoteList from "$lib/components/NoteList.svelte";
import { filteredNotes, notesStore, totalPages } from "$lib/stores/notes";
import type { FilterType, SortBy, SortOrder } from "$lib/stores/notes";
import { tagsStore } from "$lib/stores/tags";
import { onMount } from "svelte";

onMount(async () => {
  await Promise.all([notesStore.loadNotes(), tagsStore.loadTags()]);
});

// ホームページにアクセスした際に必ず一覧を更新
afterNavigate(({ to }) => {
  if (to?.url.pathname === "/") {
    notesStore.loadNotes();
    tagsStore.loadTags();
  }
});

// ローカル変数でフィルタとソートを管理（ストアと同期）
let filterType: FilterType = $notesStore.filterType;
let filterTags: string[] = $notesStore.filterTags;
let sortBy: SortBy = $notesStore.sortBy;
let sortOrder: SortOrder = $notesStore.sortOrder;

// 一括削除用の状態
let selectMode = false;
let selectedNoteIds: string[] = [];
let deleting = false;

// ストアの変更を監視（最適化：値が実際に変更された場合のみ更新）
$: filterType = $notesStore.filterType;
$: filterTags = $notesStore.filterTags;
$: sortBy = $notesStore.sortBy;
$: sortOrder = $notesStore.sortOrder;

function handleFilterChange() {
  notesStore.setFilter(filterType);
  notesStore.setPage(1);
  notesStore.loadNotes();
}

function handleTagFilterRemove(tagName: string) {
  const newTags = filterTags.filter((t) => t !== tagName);
  notesStore.setTagFilter(newTags);
  notesStore.loadNotes();
}

function clearTagFilters() {
  notesStore.setTagFilter([]);
  notesStore.loadNotes();
}

function handleSelectionChange(noteIds: string[]) {
  selectedNoteIds = noteIds;
}

function toggleSelectMode() {
  selectMode = !selectMode;
  if (!selectMode) {
    selectedNoteIds = [];
  }
}

async function handleBatchDelete() {
  if (selectedNoteIds.length === 0) {
    return;
  }

  if (!confirm(`${selectedNoteIds.length}件のノートを削除しますか？この操作は取り消せません。`)) {
    return;
  }

  deleting = true;
  try {
    await deleteNotesBatch(selectedNoteIds);
    // ストアからも削除
    selectedNoteIds.forEach((id) => {
      notesStore.removeNote(id);
    });
    selectedNoteIds = [];
    selectMode = false;
    // 一覧を再読み込み
    await notesStore.loadNotes();
  } catch (error) {
    console.error("一括削除に失敗しました:", error);
    alert("一括削除に失敗しました");
  } finally {
    deleting = false;
  }
}

function handleSortChange() {
  notesStore.setSort(sortBy, sortOrder);
}

function goToPage(page: number) {
  notesStore.setPage(page);
}
</script>

<div class="page-header">
	<h1>ノート一覧</h1>
	<div class="header-actions">
		{#if selectMode}
			<button
				class="delete-button"
				on:click={handleBatchDelete}
				disabled={selectedNoteIds.length === 0 || deleting}
			>
				{deleting ? "削除中..." : `選択したノートを削除 (${selectedNoteIds.length})`}
			</button>
			<button class="cancel-button" on:click={toggleSelectMode}>
				キャンセル
			</button>
		{:else}
			<button class="select-button" on:click={toggleSelectMode}>
				選択モード
			</button>
			<a href="/notes/new" class="new-button">新規ノート作成</a>
		{/if}
	</div>
</div>

{#if $notesStore.loading}
	<p>読み込み中...</p>
{:else}
	<ErrorDisplay error={$notesStore.error} defaultMessage="ノートの読み込みに失敗しました" />
	<div class="filters-section">
		<div class="filter-group">
			<label for="filter-type">タイプ:</label>
			<select
				id="filter-type"
				bind:value={filterType}
				on:change={handleFilterChange}
			>
				<option value="all">すべて</option>
				<option value="md">Markdown</option>
				<option value="rss">RSS</option>
				<option value="web_clip">Webクリップ</option>
			</select>
		</div>

		{#if filterTags.length > 0}
			<div class="tag-filters">
				<span>タグフィルター:</span>
				<div class="tag-filter-list">
					{#each filterTags as tagName}
						<span class="tag-filter-item">
							{tagName}
							<button
								class="remove-tag-btn"
								on:click={() => handleTagFilterRemove(tagName)}
								title="タグフィルターを削除"
							>
								×
							</button>
						</span>
					{/each}
					<button class="clear-tags-btn" on:click={clearTagFilters}>
						すべてクリア
					</button>
				</div>
			</div>
		{/if}

		<div class="filter-group">
			<label for="sort-by">並び替え:</label>
			<select
				id="sort-by"
				bind:value={sortBy}
				on:change={handleSortChange}
			>
				<option value="updated_at">更新日時</option>
				<option value="created_at">作成日時</option>
				<option value="title">タイトル</option>
				<option value="tag">タグ</option>
			</select>
			<select
				bind:value={sortOrder}
				on:change={handleSortChange}
			>
				<option value="desc">降順</option>
				<option value="asc">昇順</option>
			</select>
		</div>
	</div>

	<NoteList
		notes={$filteredNotes}
		selectable={selectMode}
		bind:selectedNoteIds
		onSelectionChange={handleSelectionChange}
	/>

	{#if $totalPages > 1}
		<div class="pagination">
			<button
				on:click={() => goToPage($notesStore.currentPage - 1)}
				disabled={$notesStore.currentPage === 1}
				class="page-btn"
			>
				前へ
			</button>
			<span class="page-info">
				ページ {$notesStore.currentPage} / {$totalPages}
			</span>
			<button
				on:click={() => goToPage($notesStore.currentPage + 1)}
				disabled={$notesStore.currentPage >= $totalPages}
				class="page-btn"
			>
				次へ
			</button>
		</div>
	{/if}
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.select-button,
	.cancel-button {
		padding: 0.75rem 1.5rem;
		background: rgba(107, 114, 128, 0.1);
		color: #6b7280;
		border: none;
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9375rem;
	}

	.select-button:hover,
	.cancel-button:hover {
		background: rgba(107, 114, 128, 0.2);
		color: #1a1a1a;
		transform: translateY(-2px);
	}

	.delete-button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		border: none;
		border-radius: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
		cursor: pointer;
		font-size: 0.9375rem;
	}

	.delete-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}

	.delete-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.new-button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		text-decoration: none;
		border-radius: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.new-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.new-button:active {
		transform: translateY(0);
	}

	.filters-section {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		flex-wrap: wrap;
		align-items: center;
	}

	.filter-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.filter-group label {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #1a1a1a;
	}

	.filter-group select {
		padding: 0.5rem 1rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 8px;
		font-size: 0.9375rem;
		color: #1a1a1a;
		background: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-group select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.tag-filters {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.tag-filters > span {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #1a1a1a;
	}

	.tag-filter-list {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.tag-filter-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}

	.remove-tag-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1.125rem;
		line-height: 1;
		padding: 0;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.remove-tag-btn:hover {
		background-color: rgba(255, 255, 255, 0.25);
		transform: scale(1.1);
	}

	.clear-tags-btn {
		padding: 0.375rem 0.875rem;
		background: rgba(107, 114, 128, 0.1);
		color: #6b7280;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.clear-tags-btn:hover {
		background: rgba(107, 114, 128, 0.2);
		color: #1a1a1a;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.page-btn {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.page-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.page-info {
		font-size: 0.9375rem;
		color: #6b7280;
		font-weight: 500;
	}
</style>


