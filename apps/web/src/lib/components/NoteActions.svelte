<script lang="ts">
import type { NoteCore } from "$lib/types";

/** ノート */
export let note: NoteCore;
/** 編集モードかどうか */
export let editing = false;
/** 保存中かどうか */
export let saving = false;
/** 削除中かどうか */
export let deleting = false;
/** 要約生成中かどうか */
export let summarizing = false;
/** コンテンツが存在するかどうか */
export let hasContent = false;
/** 編集開始ハンドラ */
export let onEdit: (() => void) | null = null;
/** 保存ハンドラ */
export let onSave: (() => void) | null = null;
/** キャンセルハンドラ */
export let onCancel: (() => void) | null = null;
/** 削除ハンドラ */
export let onDelete: (() => void) | null = null;
/** 要約生成ハンドラ */
export let onSummarize: (() => void) | null = null;
</script>

<div class="actions">
	{#if editing}
		<button class="btn-primary" on:click={onSave} disabled={saving}>
			{saving ? "保存中..." : "保存"}
		</button>
		<button class="btn-secondary" on:click={onCancel} disabled={saving}>
			キャンセル
		</button>
	{:else}
		<div class="action-group">
			{#if hasContent}
				<button
					class="btn-llm"
					on:click={onSummarize}
					disabled={summarizing}
					title="AIで要約を生成"
				>
					{summarizing ? "要約中..." : "要約"}
				</button>
			{/if}
			{#if note.type === "md"}
				<button class="btn-primary" on:click={onEdit}>編集</button>
			{/if}
		</div>
		<div class="action-separator"></div>
		<button
			class="btn-danger"
			on:click={onDelete}
			disabled={deleting}
			title="このノートを削除"
		>
			{deleting ? "削除中..." : "削除"}
		</button>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
		width: 100%;
	}

	.action-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.action-separator {
		width: 1px;
		height: 2rem;
		background: rgba(0, 0, 0, 0.1);
		margin: 0 0.5rem;
	}
</style>

