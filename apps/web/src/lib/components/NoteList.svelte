<script lang="ts">
import { getFileDownloadUrl } from "$lib/api/files";
import { notesStore } from "$lib/stores/notes";
import type { File, NoteCore } from "$lib/types";
import { formatDate } from "$lib/utils";
import { derived } from "svelte/store";

export let notes: NoteCore[];
export let selectable = false; // 選択可能モード
export let selectedNoteIds: string[] = []; // 選択されたノートIDの配列
export let onSelectionChange: (noteIds: string[]) => void = () => {};

// ファイルIDのSetを導出（O(1)検索のため）
const fileIdsSet = derived(notesStore, ($store) => {
  return new Set($store.allFiles.map((f) => f.id));
});

// 選択されたノートIDのSetを導出（O(1)検索のため）
$: selectedNoteIdsSet = new Set(selectedNoteIds);

function toggleSelection(noteId: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if (selectedNoteIds.includes(noteId)) {
    selectedNoteIds = selectedNoteIds.filter((id) => id !== noteId);
  } else {
    selectedNoteIds = [...selectedNoteIds, noteId];
  }
  onSelectionChange(selectedNoteIds);
}

function handleItemClick(noteId: string, event: Event) {
  if (selectable) {
    toggleSelection(noteId, event);
  }
}
</script>

<div class="note-list">
	{#each notes as note (note.id)}
		{@const isSelected = selectedNoteIdsSet.has(note.id)}
		{@const isFile = $fileIdsSet.has(note.id)}
		<div
			class="note-item-wrapper"
			class:selectable
			class:selected={isSelected}
		>
			{#if selectable}
				<input
					type="checkbox"
					class="note-checkbox"
					checked={isSelected}
					on:change={(e) => {
						e.stopPropagation();
						toggleSelection(note.id, e);
					}}
					on:click={(e) => e.stopPropagation()}
				/>
			{/if}
			{#if isFile}
				<a
					href={getFileDownloadUrl(note.id)}
					class="note-item file-item"
					download
					on:click={(e) => handleItemClick(note.id, e)}
				>
					<h3>{note.title}</h3>
					<div class="note-meta">
						<span class="note-type file-type">ファイル</span>
						<span class="note-date">作成: {formatDate(note.created_at)}</span>
					</div>
				</a>
			{:else}
				<a
					href="/notes/{note.id}"
					class="note-item"
					on:click={(e) => handleItemClick(note.id, e)}
				>
					<h3>{note.title}</h3>
					<div class="note-meta">
						<span class="note-type">{note.type}</span>
						<span class="note-date">更新: {formatDate(note.updated_at)}</span>
					</div>
				</a>
			{/if}
		</div>
	{:else}
		<p>ノートがありません</p>
	{/each}
</div>

<style>
	.note-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.note-item-wrapper {
		position: relative;
	}

	.note-item-wrapper.selectable {
		cursor: pointer;
	}

	.note-item-wrapper.selected .note-item {
		border-color: rgba(99, 102, 241, 0.5);
		background: rgba(99, 102, 241, 0.05);
	}

	.note-checkbox {
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		z-index: 10;
		accent-color: #6366f1;
	}

	.note-item {
		display: block;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.note-item-wrapper.selectable .note-item {
		padding-left: 3.5rem;
	}

	.note-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		border-color: rgba(99, 102, 241, 0.3);
	}

	.note-item h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1.375rem;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.4;
	}

	.note-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.5;
		align-items: center;
	}

	.note-type {
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
		border-radius: 8px;
		font-weight: 500;
		color: #6366f1;
		font-size: 0.8125rem;
	}

	.file-type {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		color: #d97706;
	}

	.file-item {
		border-left: 4px solid #fbbf24;
	}
</style>


