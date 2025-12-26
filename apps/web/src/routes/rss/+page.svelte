<script lang="ts">
import { createRSSFeed, deleteRSSFeed, fetchRSSFeed, getRSSFeeds } from "$lib/api";
import type { RSSFeed } from "$lib/types";
import { onMount } from "svelte";

let feeds: RSSFeed[] = [];
let loading = true;
let error: string | null = null;
let creating = false;
const fetching: Set<string> = new Set();
let showForm = false;
let formUrl = "";
let formTitle = "";

onMount(async () => {
  await loadFeeds();
});

async function loadFeeds() {
  loading = true;
  error = null;
  try {
    feeds = await getRSSFeeds();
  } catch (e) {
    error = e instanceof Error ? e.message : "フィードの読み込みに失敗しました";
  } finally {
    loading = false;
  }
}

async function handleCreateFeed() {
  if (!formUrl.trim() || !formTitle.trim()) {
    error = "URLとタイトルを入力してください";
    return;
  }

  error = null;
  creating = true;
  try {
    await createRSSFeed({ url: formUrl.trim(), title: formTitle.trim() });
    formUrl = "";
    formTitle = "";
    showForm = false;
    await loadFeeds();
  } catch (e) {
    error = e instanceof Error ? e.message : "フィードの登録に失敗しました";
  } finally {
    creating = false;
  }
}

async function handleDeleteFeed(feedId: string) {
  if (!confirm("このフィードを削除しますか？")) {
    return;
  }

  error = null;
  try {
    await deleteRSSFeed(feedId);
    await loadFeeds();
  } catch (e) {
    error = e instanceof Error ? e.message : "フィードの削除に失敗しました";
  }
}

async function handleFetchFeed(feedId: string) {
  fetching.add(feedId);
  error = null;
  try {
    await fetchRSSFeed(feedId);
    await loadFeeds();
  } catch (e) {
    error = e instanceof Error ? e.message : "フィードの取得に失敗しました";
  } finally {
    fetching.delete(feedId);
  }
}

async function handleFetchAll() {
  fetching.add("all");
  error = null;
  try {
    await fetchRSSFeed();
    await loadFeeds();
  } catch (e) {
    error = e instanceof Error ? e.message : "フィードの取得に失敗しました";
  } finally {
    fetching.delete("all");
  }
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "未取得";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("ja-JP");
}
</script>

<h1>RSSフィード管理</h1>

{#if error}
	<p class="error">エラー: {error}</p>
{/if}

<div class="actions">
	<button on:click={() => (showForm = !showForm)} disabled={creating}>
		{showForm ? "キャンセル" : "フィードを追加"}
	</button>
	<button on:click={handleFetchAll} disabled={fetching.has("all")}>
		{fetching.has("all") ? "取得中..." : "すべて更新"}
	</button>
</div>

{#if showForm}
	<div class="form">
		<label>
			<span>URL</span>
			<input type="url" bind:value={formUrl} placeholder="https://example.com/feed.xml" />
		</label>
		<label>
			<span>タイトル</span>
			<input type="text" bind:value={formTitle} placeholder="フィード名" />
		</label>
		<button on:click={handleCreateFeed} disabled={creating}>
			{creating ? "登録中..." : "登録"}
		</button>
	</div>
{/if}

{#if loading}
	<p>読み込み中...</p>
{:else if feeds.length === 0}
	<p>フィードが登録されていません</p>
{:else}
	<ul class="feed-list">
		{#each feeds as feed}
			<li>
				<div class="feed-info">
					<h3>{feed.title}</h3>
					<p class="url">{feed.url}</p>
					<p class="meta">最終取得: {formatDate(feed.last_fetched_at)}</p>
				</div>
				<div class="feed-actions">
					<button
						on:click={() => handleFetchFeed(feed.id)}
						disabled={fetching.has(feed.id)}
					>
						{fetching.has(feed.id) ? "取得中..." : "更新"}
					</button>
					<button on:click={() => handleDeleteFeed(feed.id)}>削除</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.actions button {
		padding: 0.5rem 1rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.actions button:hover:not(:disabled) {
		background: #4f46e5;
	}

	.actions button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.form label {
		display: block;
		margin-bottom: 1rem;
	}

	.form label span {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #374151;
	}

	.form input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form button {
		padding: 0.5rem 1rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.form button:hover:not(:disabled) {
		background: #4f46e5;
	}

	.form button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feed-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.feed-list li {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.feed-info {
		flex: 1;
	}

	.feed-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.feed-info .url {
		margin: 0.25rem 0;
		font-size: 0.875rem;
		color: #6b7280;
		word-break: break-all;
	}

	.feed-info .meta {
		margin: 0.5rem 0 0 0;
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.feed-actions {
		display: flex;
		gap: 0.5rem;
	}

	.feed-actions button {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.feed-actions button:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.feed-actions button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		color: #ef4444;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #fef2f2;
		border-radius: 6px;
	}
</style>


