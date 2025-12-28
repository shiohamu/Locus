<script lang="ts">
import { createWebClip, deleteWebClip, getWebClips, refetchWebClip } from "$lib/api";
import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
import { formatDate } from "$lib/utils";
import type { WebClip } from "@locus/shared";
import { onMount } from "svelte";

interface WebClipWithNote extends WebClip {
  note?: {
    id: string;
    type: string;
    title: string;
    created_at: number;
    updated_at: number;
  };
}

let webClips: WebClipWithNote[] = [];
let loading = true;
let error: unknown | null = null;
let creating = false;
const refetching: Set<string> = new Set();
let showForm = false;
let formUrl = "";

onMount(async () => {
  await loadWebClips();
});

async function loadWebClips() {
  loading = true;
  error = null;
  try {
    webClips = await getWebClips();
  } catch (e) {
    error = e;
  } finally {
    loading = false;
  }
}

async function handleCreateWebClip() {
  if (!formUrl.trim()) {
    error = "URLを入力してください";
    return;
  }

  error = null;
  creating = true;
  try {
    await createWebClip(formUrl.trim());
    formUrl = "";
    showForm = false;
    await loadWebClips();
  } catch (e) {
    error = e;
  } finally {
    creating = false;
  }
}

async function handleDeleteWebClip(noteId: string) {
  if (!confirm("このWebクリップを削除しますか？")) {
    return;
  }

  error = null;
  try {
    await deleteWebClip(noteId);
    await loadWebClips();
  } catch (e) {
    error = e;
  }
}

async function handleRefetchWebClip(noteId: string) {
  refetching.add(noteId);
  error = null;
  try {
    await refetchWebClip(noteId);
    await loadWebClips();
  } catch (e) {
    error = e;
  } finally {
    refetching.delete(noteId);
  }
}
</script>

<h1>Webクリップ管理</h1>

<ErrorDisplay {error} defaultMessage="Webクリップの操作に失敗しました" />

<div class="actions">
	<button on:click={() => (showForm = !showForm)} disabled={creating}>
		{showForm ? "キャンセル" : "Webクリップを追加"}
	</button>
</div>

{#if showForm}
	<div class="form">
		<label>
			<span>URL</span>
			<input type="url" bind:value={formUrl} placeholder="https://example.com/article" />
		</label>
		<button on:click={handleCreateWebClip} disabled={creating}>
			{creating ? "取得中..." : "取得"}
		</button>
	</div>
{/if}

{#if loading}
	<p>読み込み中...</p>
{:else if webClips.length === 0}
	<p>Webクリップが登録されていません</p>
{:else}
	<ul class="web-clip-list">
		{#each webClips as webClip}
			<li>
				<div class="web-clip-info">
					<h3>
						{#if webClip.note}
							<a href="/notes/{webClip.note.id}">{webClip.note.title}</a>
						{:else}
							タイトルなし
						{/if}
					</h3>
					<p class="url">
						<a href={webClip.source_url} target="_blank" rel="noopener noreferrer">
							{webClip.source_url}
						</a>
					</p>
					<p class="meta">取得日時: {formatDate(webClip.fetched_at)}</p>
				</div>
				<div class="web-clip-actions">
					<button
						on:click={() => handleRefetchWebClip(webClip.note_id)}
						disabled={refetching.has(webClip.note_id)}
					>
						{refetching.has(webClip.note_id) ? "再取得中..." : "再取得"}
					</button>
					<button on:click={() => handleDeleteWebClip(webClip.note_id)}>削除</button>
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

	.web-clip-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.web-clip-list li {
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

	.web-clip-info {
		flex: 1;
	}

	.web-clip-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.web-clip-info h3 a {
		color: #6366f1;
		text-decoration: none;
	}

	.web-clip-info h3 a:hover {
		text-decoration: underline;
	}

	.web-clip-info .url {
		margin: 0.25rem 0;
		font-size: 0.875rem;
		color: #6b7280;
		word-break: break-all;
	}

	.web-clip-info .url a {
		color: #6366f1;
		text-decoration: none;
	}

	.web-clip-info .url a:hover {
		text-decoration: underline;
	}

	.web-clip-info .meta {
		margin: 0.5rem 0 0 0;
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.web-clip-actions {
		display: flex;
		gap: 0.5rem;
	}

	.web-clip-actions button {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.web-clip-actions button:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.web-clip-actions button:disabled {
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

