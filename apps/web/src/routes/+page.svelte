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

<h1>ノート一覧</h1>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p style="color: red;">エラー: {error}</p>
{:else}
	<NoteList {notes} />
{/if}


