<script lang="ts">
import { marked } from "marked";

/** 要約テキスト */
export let summary: string | null = null;
/** 表示するかどうか */
export let show = false;
/** 閉じるハンドラ */
export let onClose: (() => void) | null = null;
</script>

{#if show && summary}
	<div class="llm-section">
		<div class="llm-header">
			<h2>要約</h2>
			<button class="btn-close" on:click={onClose}>×</button>
		</div>
		<div class="llm-content markdown-preview">{@html marked.parse(summary)}</div>
	</div>
{/if}

<style>
	.llm-section {
		margin-top: 1.5rem;
		padding: 1.5rem;
		background: rgba(16, 185, 129, 0.05);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
	}

	.llm-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.llm-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #059669;
	}

	.llm-content {
		background: rgba(255, 255, 255, 0.9);
		padding: 1rem;
		border-radius: 8px;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.btn-close:hover {
		background: rgba(0, 0, 0, 0.1);
	}
</style>

