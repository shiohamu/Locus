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
	<p class="error">エラー: {error}</p>
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
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		justify-content: flex-end;
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
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
	}

	button:last-child:hover:not(:disabled) {
		box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
	}
</style>

