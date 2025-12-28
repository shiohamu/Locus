<script lang="ts">
import NoteEditor from "./NoteEditor.svelte";

/** タイトル */
export let title = "";
/** コンテンツ */
export let content = "";
/** プレビュー表示フラグ */
export let showPreview = false;
/** 保存中かどうか */
export let saving = false;
</script>

<NoteEditor bind:title bind:content bind:showPreview />
{#if saving}
	<p class="auto-save-indicator">自動保存中...</p>
{/if}

<style>
	.auto-save-indicator {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-style: italic;
		text-align: right;
	}
</style>





