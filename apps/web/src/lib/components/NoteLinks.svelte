<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import type { Link, NoteCore } from "$lib/types";
	import { getNoteLinks, getNote } from "$lib/api";

	export let noteId: string;

	let outgoingLinks: Link[] = [];
	let incomingLinks: Link[] = [];
	let loading = true;
	let error: string | null = null;

	// リンク先ノートの情報を保持
	let outgoingNotes: Map<string, NoteCore> = new Map();
	let incomingNotes: Map<string, NoteCore> = new Map();

	onMount(async () => {
		await loadLinks();
	});

	async function loadLinks() {
		loading = true;
		error = null;
		try {
			const links = await getNoteLinks(noteId) as { outgoing: Link[]; incoming: Link[] };
			outgoingLinks = links.outgoing;
			incomingLinks = links.incoming;

			// リンク先ノートの情報を取得
			const notePromises: Promise<void>[] = [];

			for (const link of outgoingLinks) {
				notePromises.push(
					getNote(link.to_note_id)
						.then((note: NoteCore | null) => {
							if (note) {
								outgoingNotes.set(link.to_note_id, note);
							}
						})
						.catch(() => {
							// ノートが存在しない場合は無視
						})
				);
			}

			for (const link of incomingLinks) {
				notePromises.push(
					getNote(link.from_note_id)
						.then((note: NoteCore | null) => {
							if (note) {
								incomingNotes.set(link.from_note_id, note);
							}
						})
						.catch(() => {
							// ノートが存在しない場合は無視
						})
				);
			}

			await Promise.all(notePromises);
		} catch (e) {
			error = e instanceof Error ? e.message : "リンクの読み込みに失敗しました";
		} finally {
			loading = false;
		}
	}

	function handleLinkClick(noteId: string) {
		goto(`/notes/${noteId}`);
	}
</script>

<div class="note-links">
	<h3>リンク</h3>

	{#if loading}
		<p>読み込み中...</p>
	{:else if error}
		<p class="error">エラー: {error}</p>
	{:else}
		{#if outgoingLinks.length > 0 || incomingLinks.length > 0}
			{#if outgoingLinks.length > 0}
				<div class="links-section">
					<h4>このノートからリンク</h4>
					<div class="links-list">
						{#each outgoingLinks as link (link.to_note_id)}
							{@const note = outgoingNotes.get(link.to_note_id)}
							<button
								class="link-item"
								on:click={() => handleLinkClick(link.to_note_id)}
								title={note ? note.title : link.to_note_id}
							>
								{note ? note.title : link.to_note_id}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if incomingLinks.length > 0}
				<div class="links-section">
					<h4>このノートにリンク</h4>
					<div class="links-list">
						{#each incomingLinks as link (link.from_note_id)}
							{@const note = incomingNotes.get(link.from_note_id)}
							<button
								class="link-item"
								on:click={() => handleLinkClick(link.from_note_id)}
								title={note ? note.title : link.from_note_id}
							>
								{note ? note.title : link.from_note_id}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<p>リンクがありません</p>
		{/if}
	{/if}
</div>

<style>
	.note-links {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.note-links h3 {
		margin-top: 0;
	}

	.links-section {
		margin-top: 1rem;
	}

	.links-section h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #6b7280;
		margin: 0 0 0.75rem 0;
	}

	.links-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.link-item {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
		border: none;
		border-radius: 10px;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #1e40af;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(30, 64, 175, 0.15);
	}

	.link-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
		background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
	}

	.link-item:active {
		transform: translateY(0);
	}
</style>


