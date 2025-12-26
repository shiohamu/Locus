<script lang="ts">
import { addTagToNote, getTags, getTagsByNote, removeTagFromNote } from "$lib/api";
import type { Tag } from "$lib/types";
import { onMount } from "svelte";

export let noteId: string;

let allTags: Tag[] = [];
let noteTags: Tag[] = [];
let loading = true;
let error: string | null = null;
let showAddTag = false;
let selectedTagId = "";

onMount(async () => {
  await loadData();
});

async function loadData() {
  loading = true;
  error = null;
  try {
    [allTags, noteTags] = await Promise.all([getTags(), getTagsByNote(noteId)]);
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの読み込みに失敗しました";
  } finally {
    loading = false;
  }
}

async function handleAddTag() {
  if (!selectedTagId) return;

  try {
    await addTagToNote(noteId, selectedTagId);
    await loadData();
    showAddTag = false;
    selectedTagId = "";
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの追加に失敗しました";
  }
}

async function handleRemoveTag(tagId: string) {
  try {
    await removeTagFromNote(noteId, tagId);
    await loadData();
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの削除に失敗しました";
  }
}

$: availableTags = allTags.filter((tag) => !noteTags.some((nt) => nt.id === tag.id));
</script>

<div class="note-tags">
	<h3>タグ</h3>

	{#if loading}
		<p>読み込み中...</p>
	{:else if error}
		<p class="error">エラー: {error}</p>
	{:else}
		<div class="tags-list">
			{#each noteTags as tag (tag.id)}
				<span class="tag-item">
					{tag.name}
					<button
						class="remove-btn"
						on:click={() => handleRemoveTag(tag.id)}
						title="タグを削除"
					>
						×
					</button>
				</span>
			{/each}
		</div>

		{#if showAddTag}
			<div class="add-tag-form">
				<select bind:value={selectedTagId} class="tag-select">
					<option value="">タグを選択</option>
					{#each availableTags as tag}
						<option value={tag.id}>{tag.name}</option>
					{/each}
				</select>
				<button on:click={handleAddTag} disabled={!selectedTagId}>
					追加
				</button>
				<button on:click={() => (showAddTag = false)}>キャンセル</button>
			</div>
		{:else}
			<button on:click={() => (showAddTag = true)} class="add-btn">
				+ タグを追加
			</button>
		{/if}
	{/if}
</div>

<style>
	.note-tags {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.note-tags h3 {
		margin-top: 0;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tag-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 12px;
		font-size: 0.9375rem;
		line-height: 1.5;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
		transition: all 0.2s;
	}

	.tag-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
	}

	.remove-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1.25rem;
		line-height: 1;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.remove-btn:hover {
		background-color: rgba(255, 255, 255, 0.25);
		transform: scale(1.1);
	}

	.add-tag-form {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.tag-select {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 10px;
		font-size: 1rem;
		color: #1a1a1a;
		line-height: 1.5;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.2s;
	}

	.tag-select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.add-tag-form button {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.add-tag-form button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.add-tag-form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.add-btn {
		margin-top: 0.75rem;
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}
</style>

