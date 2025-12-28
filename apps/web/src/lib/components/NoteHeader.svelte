<script lang="ts">
import type { NoteCore } from "$lib/types";

/** ノート */
export let note: NoteCore;
/** 編集モードかどうか */
export let editing = false;
/** タイトル（編集用） */
export let title = "";
/** タイトル変更ハンドラ */
export let onTitleChange: ((value: string) => void) | null = null;
</script>

<div class="note-header">
	{#if editing}
		<input
			type="text"
			value={title}
			on:input={(e) => {
				title = e.currentTarget.value;
				onTitleChange?.(title);
			}}
			placeholder="タイトル"
			class="title-input"
		/>
	{:else}
		<h1>{note.title}</h1>
	{/if}
</div>

<style>
	.note-header {
		margin-bottom: 1rem;
	}

	.note-header h1 {
		margin: 0;
		word-break: break-word;
		overflow-wrap: break-word;
		line-height: 1.4;
	}

	.title-input {
		font-size: 1.75rem;
		padding: 0.875rem 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		width: 100%;
		color: #1a1a1a;
		line-height: 1.5;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.2s;
	}

	.title-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}
</style>

