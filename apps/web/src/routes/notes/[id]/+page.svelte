<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { getNote, getNoteMD, updateNoteMD, deleteNote } from "$lib/api";
	import { nowTimestamp } from "$lib/utils";
	import type { NoteCore, NoteMD } from "$lib/types";
	import NoteEditor from "$lib/components/NoteEditor.svelte";

	let note: NoteCore | null = null;
	let noteMD: NoteMD | null = null;
	let editing = false;
	let title = "";
	let content = "";
	let loading = true;
	let saving = false;
	let deleting = false;
	let error: string | null = null;

	$: noteId = $page.params.id;

	onMount(async () => {
		await loadNote();
	});

	async function loadNote() {
		loading = true;
		error = null;
		try {
			note = await getNote(noteId);
			if (!note) {
				error = "ノートが見つかりません";
				return;
			}

			if (note.type === "md") {
				noteMD = await getNoteMD(noteId);
				if (noteMD) {
					title = note.title;
					content = noteMD.content;
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : "ノートの読み込みに失敗しました";
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		if (!note || !noteMD) return;

		saving = true;
		error = null;

		try {
			const updatedCore: NoteCore = {
				...note,
				title: title.trim(),
				updated_at: nowTimestamp(),
			};

			const updatedMD: NoteMD = {
				...noteMD,
				content: content,
			};

			await updateNoteMD(noteId, { core: updatedCore, md: updatedMD });
			editing = false;
			await loadNote();
		} catch (e) {
			error = e instanceof Error ? e.message : "ノートの更新に失敗しました";
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm("このノートを削除しますか？")) return;

		deleting = true;
		error = null;

		try {
			await deleteNote(noteId);
			goto("/");
		} catch (e) {
			error = e instanceof Error ? e.message : "ノートの削除に失敗しました";
		} finally {
			deleting = false;
		}
	}

	function startEdit() {
		if (note && noteMD) {
			title = note.title;
			content = noteMD.content;
			editing = true;
		}
	}

	function cancelEdit() {
		editing = false;
		if (note && noteMD) {
			title = note.title;
			content = noteMD.content;
		}
	}
</script>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p style="color: red;">エラー: {error}</p>
{:else if note && noteMD}
	<div class="note-page">
		<div class="note-header">
			{#if editing}
				<input
					type="text"
					bind:value={title}
					placeholder="タイトル"
					class="title-input"
				/>
			{:else}
				<h1>{note.title}</h1>
			{/if}

			<div class="actions">
				{#if editing}
					<button on:click={handleSave} disabled={saving}>
						{saving ? "保存中..." : "保存"}
					</button>
					<button on:click={cancelEdit} disabled={saving}>
						キャンセル
					</button>
				{:else}
					<button on:click={startEdit}>編集</button>
					<button on:click={handleDelete} disabled={deleting}>
						{deleting ? "削除中..." : "削除"}
					</button>
				{/if}
			</div>
		</div>

		{#if editing}
			<NoteEditor bind:title bind:content />
		{:else}
			<div class="note-content">
				<pre>{noteMD.content}</pre>
			</div>
		{/if}
	</div>
{/if}

<style>
	.note-page {
		max-width: 800px;
		margin: 0 auto;
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.title-input {
		font-size: 1.5rem;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		width: 100%;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #007bff;
		color: white;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.note-content {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f5f5f5;
		border-radius: 4px;
	}

	.note-content pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
	}
</style>

