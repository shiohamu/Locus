<script lang="ts">
import {
	addTagToNote,
	createTag,
	generateTagSuggestions,
	getTags,
	getTagsByNote,
	removeTagFromNote,
} from "$lib/api";
import type { Tag } from "$lib/types";
import { onMount } from "svelte";

export let noteId: string;

let allTags: Tag[] = [];
let noteTags: Tag[] = [];
let loading = true;
let error: string | null = null;
let showAddTag = false;
let selectedTagId = "";
let showSuggestions = false;
let generatingSuggestions = false;
let suggestions: Array<{ name: string; confidence: number; method: "llm" | "rule-based" }> = [];
let selectedSuggestions: string[] = [];

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

async function handleGenerateSuggestions() {
  generatingSuggestions = true;
  error = null;
  try {
    const result = await generateTagSuggestions(noteId);
    suggestions = result.suggestions;
    selectedSuggestions = [];
    showSuggestions = true;
  } catch (e) {
    error = e instanceof Error ? e.message : "タグ候補の生成に失敗しました";
  } finally {
    generatingSuggestions = false;
  }
}

function toggleSuggestion(name: string) {
  if (selectedSuggestions.includes(name)) {
    // 既に選択されている場合は解除
    selectedSuggestions = selectedSuggestions.filter((n) => n !== name);
  } else {
    // 10個まで選択可能
    if (selectedSuggestions.length >= 10) {
      return;
    }
    selectedSuggestions = [...selectedSuggestions, name];
  }
}

async function handleApplySuggestions() {
  if (selectedSuggestions.length === 0) return;

  try {
    // 選択された候補をタグとして作成または取得し、ノートに追加
    for (const tagName of selectedSuggestions) {
      // 既存のタグを確認
      let tag = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());

      // タグが存在しない場合は作成
      if (!tag) {
        tag = await createTag({ name: tagName });
        allTags.push(tag);
      }

      // ノートにタグを追加（既に追加されている場合はスキップ）
      if (!noteTags.some((nt) => nt.id === tag.id)) {
        await addTagToNote(noteId, tag.id);
      }
    }

    // データを再読み込み
    await loadData();
    showSuggestions = false;
    selectedSuggestions = [];
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの適用に失敗しました";
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

		{#if showSuggestions}
			<div class="suggestions-section">
				<div class="suggestions-header">
					<h4>タグ候補（最大10個まで選択可能）</h4>
					<button on:click={() => (showSuggestions = false)} class="close-btn">
						×
					</button>
				</div>
				{#if suggestions.length > 0}
					<div class="suggestions-list">
						{#each suggestions as suggestion (suggestion.name)}
							{@const isSelected = selectedSuggestions.includes(suggestion.name)}
							{@const isDisabled = !isSelected && selectedSuggestions.length >= 10}
							<label class="suggestion-item" class:disabled={isDisabled}>
								<input
									type="checkbox"
									checked={isSelected}
									disabled={isDisabled}
									on:change={() => toggleSuggestion(suggestion.name)}
								/>
								<span class="suggestion-name">{suggestion.name}</span>
								<span class="suggestion-method">
									{suggestion.method === "llm" ? "🤖 LLM" : "📋 ルール"}
								</span>
								<span class="suggestion-confidence">
									{Math.round(suggestion.confidence * 100)}%
								</span>
							</label>
						{/each}
					</div>
					<div class="suggestions-actions">
						<div class="selection-info">
							{selectedSuggestions.length} / 10 個選択中
						</div>
						<button
							on:click={handleApplySuggestions}
							disabled={selectedSuggestions.length === 0}
							class="apply-btn"
						>
							選択したタグを適用 ({selectedSuggestions.length})
						</button>
					</div>
				{:else}
					<p class="no-suggestions">候補が見つかりませんでした</p>
				{/if}
			</div>
		{/if}

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
			<div class="tag-actions">
				<button on:click={() => (showAddTag = true)} class="add-btn">
					+ タグを追加
				</button>
				<button
					on:click={handleGenerateSuggestions}
					disabled={generatingSuggestions}
					class="suggest-btn"
				>
					{generatingSuggestions ? "生成中..." : "🤖 タグ候補を生成"}
				</button>
			</div>
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

	.tag-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.75rem;
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
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}

	.suggest-btn {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
	}

	.suggest-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
	}

	.suggest-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.suggestions-section {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: rgba(249, 250, 251, 0.9);
		border-radius: 12px;
		border: 2px solid rgba(99, 102, 241, 0.2);
	}

	.suggestions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.suggestions-header h4 {
		margin: 0;
		font-size: 1.125rem;
		color: #1a1a1a;
	}

	.close-btn {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background-color: rgba(107, 114, 128, 0.1);
		color: #1a1a1a;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: white;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		border: 2px solid transparent;
	}

	.suggestion-item:hover:not(.disabled) {
		border-color: rgba(99, 102, 241, 0.3);
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
	}

	.suggestion-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #f3f4f6;
	}

	.suggestion-item input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.suggestion-name {
		flex: 1;
		font-weight: 500;
		color: #1a1a1a;
	}

	.suggestion-method {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.suggestion-confidence {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.suggestions-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.selection-info {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.apply-btn {
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

	.apply-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.apply-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.no-suggestions {
		color: #6b7280;
		text-align: center;
		padding: 1rem;
	}
</style>

