<script lang="ts">
import { createTag, getTags } from "$lib/api";
import type { Tag } from "$lib/types";
import { onMount } from "svelte";

export let selectedTagIds: string[] = [];
export let onTagsChange: (tagIds: string[]) => void = () => {};

let allTags: Tag[] = [];
let loading = true;
let error: string | null = null;
let showAddTag = false;
let newTagName = "";
let creatingTag = false;

onMount(async () => {
  await loadTags();
});

async function loadTags() {
  loading = true;
  error = null;
  try {
    allTags = await getTags();
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの読み込みに失敗しました";
  } finally {
    loading = false;
  }
}

function toggleTag(tagId: string) {
  if (selectedTagIds.includes(tagId)) {
    selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
  } else {
    selectedTagIds = [...selectedTagIds, tagId];
  }
  onTagsChange(selectedTagIds);
}

async function handleCreateTag() {
  if (!newTagName.trim()) {
    error = "タグ名を入力してください";
    return;
  }

  creatingTag = true;
  error = null;
  try {
    const newTag = await createTag({ name: newTagName.trim() });
    allTags = [...allTags, newTag];
    selectedTagIds = [...selectedTagIds, newTag.id];
    onTagsChange(selectedTagIds);
    newTagName = "";
    showAddTag = false;
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの作成に失敗しました";
  } finally {
    creatingTag = false;
  }
}

$: selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
$: availableTags = allTags.filter((tag) => !selectedTagIds.includes(tag.id));
</script>

<div class="tag-selector">
	<h3>タグ</h3>

	{#if loading}
		<p>読み込み中...</p>
	{:else if error}
		<p class="error">エラー: {error}</p>
	{/if}

	{#if selectedTags.length > 0}
		<div class="selected-tags">
			{#each selectedTags as tag (tag.id)}
				<span class="tag-item">
					{tag.name}
					<button
						class="remove-btn"
						on:click={() => toggleTag(tag.id)}
						title="タグを削除"
					>
						×
					</button>
				</span>
			{/each}
		</div>
	{/if}

	{#if showAddTag}
		<div class="add-tag-form">
			<div class="form-row">
				<input
					type="text"
					bind:value={newTagName}
					placeholder="新しいタグ名を入力"
					class="tag-input"
					on:keydown={(e) => {
						if (e.key === "Enter") {
							handleCreateTag();
						} else if (e.key === "Escape") {
							showAddTag = false;
							newTagName = "";
						}
					}}
				/>
				<button
					on:click={handleCreateTag}
					disabled={!newTagName.trim() || creatingTag}
					class="create-btn"
				>
					{creatingTag ? "作成中..." : "作成"}
				</button>
				<button on:click={() => {
					showAddTag = false;
					newTagName = "";
				}} class="cancel-btn">
					キャンセル
				</button>
			</div>
		</div>
	{:else}
		<div class="tag-actions">
			{#if availableTags.length > 0}
				<select
					class="tag-select"
					on:change={(e) => {
						const tagId = e.currentTarget.value;
						if (tagId) {
							toggleTag(tagId);
							e.currentTarget.value = "";
						}
					}}
				>
					<option value="">既存のタグを選択</option>
					{#each availableTags as tag}
						<option value={tag.id}>{tag.name}</option>
					{/each}
				</select>
			{/if}
			<button on:click={() => (showAddTag = true)} class="add-btn">
				+ 新規タグを作成
			</button>
		</div>
	{/if}
</div>

<style>
	.tag-selector {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.tag-selector h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		color: #1a1a1a;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1rem;
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
		margin-top: 1rem;
	}

	.form-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.tag-input {
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

	.tag-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.create-btn,
	.cancel-btn {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.create-btn {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.create-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.create-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.cancel-btn {
		background: rgba(107, 114, 128, 0.1);
		color: #6b7280;
	}

	.cancel-btn:hover {
		background: rgba(107, 114, 128, 0.2);
	}

	.tag-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
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
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.add-btn {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
		white-space: nowrap;
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}

	.error {
		color: #ef4444;
		margin: 0.5rem 0;
		font-size: 0.875rem;
	}
</style>

