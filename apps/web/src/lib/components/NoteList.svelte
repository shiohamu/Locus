<script lang="ts">
	import type { NoteCore } from "$lib/types";
	import { formatDate } from "$lib/utils";

	export let notes: NoteCore[];
</script>

<div class="note-list">
	{#each notes as note (note.id)}
		<a href="/notes/{note.id}" class="note-item">
			<h3>{note.title}</h3>
			<div class="note-meta">
				<span class="note-type">{note.type}</span>
				<span class="note-date">更新: {formatDate(note.updated_at)}</span>
			</div>
		</a>
	{:else}
		<p>ノートがありません</p>
	{/each}
</div>

<style>
	.note-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.note-item {
		display: block;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		text-decoration: none;
		color: inherit;
		transition: background-color 0.2s;
	}

	.note-item:hover {
		background-color: #f5f5f5;
	}

	.note-item h3 {
		margin: 0 0 0.5rem 0;
	}

	.note-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #666;
	}

	.note-type {
		padding: 0.25rem 0.5rem;
		background-color: #e0e0e0;
		border-radius: 4px;
	}
</style>


