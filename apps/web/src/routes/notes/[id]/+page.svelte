<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { getNote, getNoteMD, updateNoteMD, deleteNote } from "$lib/api";
	import { nowTimestamp } from "$lib/utils";
	import type { NoteCore, NoteMD } from "$lib/types";
	import NoteEditor from "$lib/components/NoteEditor.svelte";
	import NoteTags from "$lib/components/NoteTags.svelte";

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
	<p class="error">エラー: {error}</p>
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

		<NoteTags {noteId} />
	</div>
{/if}

<style>
	.note-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		gap: 1rem;
	}

	.note-header h1 {
		margin: 0;
		flex: 1;
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

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	button {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 10px;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9375rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	button:last-child {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	button:last-child:hover:not(:disabled) {
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}

	.note-content {
		margin-top: 1.5rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.note-content pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
		font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
		font-size: 1rem;
		line-height: 1.8;
		color: #1a1a1a;
	}
</style>

