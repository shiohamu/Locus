<script lang="ts">
	import { onMount } from "svelte";
	import type { NoteCore } from "$lib/types";
	import { getNotes } from "$lib/api";
	import NoteList from "$lib/components/NoteList.svelte";

	let notes: NoteCore[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			notes = await getNotes();
		} catch (e) {
			error = e instanceof Error ? e.message : "Unknown error";
		} finally {
			loading = false;
		}
	});
</script>

<div class="page-header">
	<h1>ノート一覧</h1>
	<a href="/notes/new" class="new-button">新規ノート作成</a>
</div>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p style="color: red;">エラー: {error}</p>
{:else}
	<NoteList {notes} />
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.new-button {
		padding: 0.5rem 1rem;
		background-color: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.new-button:hover {
		background-color: #0056b3;
	}
</style>


