<script lang="ts">
import { goto } from "$app/navigation";
import { searchNotes } from "$lib/api";
import type { NoteCore } from "$lib/types";
import { onMount } from "svelte";

let query = "";
let results: NoteCore[] = [];
let loading = false;
let error: string | null = null;
let hasSearched = false;

async function handleSearch() {
  if (!query.trim()) {
    return;
  }

  loading = true;
  error = null;
  hasSearched = true;
  try {
    results = await searchNotes(query.trim());
  } catch (e) {
    error = e instanceof Error ? e.message : "検索に失敗しました";
    results = [];
  } finally {
    loading = false;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    handleSearch();
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("ja-JP");
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
</script>

<h1>検索</h1>

<div class="search-form">
	<input
		type="text"
		bind:value={query}
		on:keydown={handleKeydown}
		placeholder="検索キーワードを入力..."
		class="search-input"
	/>
	<button on:click={handleSearch} disabled={loading}>
		{loading ? "検索中..." : "検索"}
	</button>
</div>

{#if error}
	<p class="error">エラー: {error}</p>
{/if}

{#if hasSearched && !loading}
	{#if results.length === 0}
		<p class="no-results">検索結果が見つかりませんでした</p>
	{:else}
		<p class="results-count">{results.length}件の結果</p>
		<ul class="results-list">
			{#each results as note}
				<li class="result-item" on:click={() => goto(`/notes/${note.id}`)}>
					<h3 class="result-title" set:html={highlightText(note.title, query)}></h3>
					<p class="result-meta">
						{formatDate(note.updated_at)} 更新
					</p>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.search-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.search-input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.search-form button {
		padding: 0.75rem 1.5rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
	}

	.search-form button:hover:not(:disabled) {
		background: #4f46e5;
	}

	.search-form button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.results-count {
		margin-bottom: 1rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.results-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.result-item {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.result-item:hover {
		border-color: #6366f1;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
		transform: translateY(-2px);
	}

	.result-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
		font-weight: 600;
	}

	.result-title :global(mark) {
		background: #fef3c7;
		color: #92400e;
		padding: 0 2px;
		border-radius: 2px;
	}

	.result-meta {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.no-results {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.error {
		color: #ef4444;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #fef2f2;
		border-radius: 6px;
	}
</style>


