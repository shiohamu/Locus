<script lang="ts">
	import { goto } from "$app/navigation";
	import { generateId, nowTimestamp } from "$lib/utils";
	import { createNoteMD } from "$lib/api";
	import type { NoteCore, NoteMD } from "$lib/types";
	import NoteEditor from "$lib/components/NoteEditor.svelte";

	let title = "";
	let content = "";
	let saving = false;
	let error: string | null = null;

	async function handleSave() {
		if (!title.trim()) {
			error = "タイトルを入力してください";
			return;
		}

		saving = true;
		error = null;

		try {
			const now = nowTimestamp();
			const id = generateId();

			const core: NoteCore = {
				id,
				type: "md",
				title: title.trim(),
				created_at: now,
				updated_at: now,
				deleted_at: null,
			};

			const md: NoteMD = {
				note_id: id,
				content: content,
			};

			await createNoteMD({ core, md });
			goto(`/notes/${id}`);
		} catch (e) {
			error = e instanceof Error ? e.message : "ノートの作成に失敗しました";
		} finally {
			saving = false;
		}
	}
</script>

<h1>新規ノート作成</h1>

{#if error}
	<p style="color: red;">エラー: {error}</p>
{/if}

	<NoteEditor bind:title bind:content />

<div class="actions">
	<button on:click={handleSave} disabled={saving || !title.trim()}>
		{saving ? "保存中..." : "保存"}
	</button>
	<button on:click={() => goto("/")}>キャンセル</button>
</div>

<style>
	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
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
</style>

