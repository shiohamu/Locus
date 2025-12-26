<script lang="ts">
import { getNotes, getTags } from "$lib/api";
import NoteList from "$lib/components/NoteList.svelte";
import type { NoteCore } from "$lib/types";
import type { Tag } from "$lib/types";
import { onMount } from "svelte";

let allNotes: NoteCore[] = [];
let notes: NoteCore[] = [];
let tags: Tag[] = [];
let loading = true;
let error: string | null = null;

// フィルタ・ソート・ページネーション設定
type FilterType = "all" | "md" | "rss";
type SortBy = "updated_at" | "created_at" | "title";
type SortOrder = "desc" | "asc";

const filterType: FilterType = "all";
const sortBy: SortBy = "updated_at";
const sortOrder: SortOrder = "desc";
let currentPage = 1;
const itemsPerPage = 20;

onMount(async () => {
  await Promise.all([loadNotes(), loadTags()]);
});

async function loadNotes() {
  loading = true;
  error = null;
  try {
    allNotes = await getNotes({ limit: 10000 });
    applyFilters();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  } finally {
    loading = false;
  }
}

async function loadTags() {
  try {
    tags = await getTags();
  } catch (e) {
    // タグの読み込み失敗は無視
  }
}

function applyFilters() {
  let filtered = [...allNotes];

  // タイプフィルタ
  if (filterType !== "all") {
    filtered = filtered.filter((note) => note.type === filterType);
  }

  // ソート
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title, "ja");
    } else if (sortBy === "updated_at") {
      comparison = a.updated_at - b.updated_at;
    } else if (sortBy === "created_at") {
      comparison = a.created_at - b.created_at;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  // ページネーション
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  notes = filtered.slice(startIndex, endIndex);
}

$: {
  if (allNotes.length > 0) {
    applyFilters();
  }
}

$: totalPages = Math.ceil(
  (filterType === "all" ? allNotes.length : allNotes.filter((n) => n.type === filterType).length) /
    itemsPerPage
);

function handleFilterChange() {
  currentPage = 1;
  applyFilters();
}

function handleSortChange() {
  applyFilters();
}

function goToPage(page: number) {
  currentPage = page;
  applyFilters();
}
</script>

<div class="page-header">
	<h1>ノート一覧</h1>
	<a href="/notes/new" class="new-button">新規ノート作成</a>
</div>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p class="error">エラー: {error}</p>
{:else}
	<div class="filters-section">
		<div class="filter-group">
			<label for="filter-type">タイプ:</label>
			<select id="filter-type" bind:value={filterType} on:change={handleFilterChange}>
				<option value="all">すべて</option>
				<option value="md">Markdown</option>
				<option value="rss">RSS</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="sort-by">並び替え:</label>
			<select id="sort-by" bind:value={sortBy} on:change={handleSortChange}>
				<option value="updated_at">更新日時</option>
				<option value="created_at">作成日時</option>
				<option value="title">タイトル</option>
			</select>
			<select bind:value={sortOrder} on:change={handleSortChange}>
				<option value="desc">降順</option>
				<option value="asc">昇順</option>
			</select>
		</div>
	</div>

	<NoteList {notes} />

	{#if totalPages > 1}
		<div class="pagination">
			<button
				on:click={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				class="page-btn"
			>
				前へ
			</button>
			<span class="page-info">
				ページ {currentPage} / {totalPages}
			</span>
			<button
				on:click={() => goToPage(currentPage + 1)}
				disabled={currentPage >= totalPages}
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


