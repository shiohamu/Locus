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
	<p class="error">エラー: {error}</p>
{:else}
	<NoteList {notes} />
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.new-button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		text-decoration: none;
		border-radius: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.new-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.new-button:active {
		transform: translateY(0);
	}
</style>


