<script lang="ts">
import type { NoteMD, RSSItem, WebClip } from "$lib/types";
import { marked } from "marked";

/** Markdownノート */
export let noteMD: NoteMD | null = null;
/** RSSアイテム */
export let rssItem: RSSItem | null = null;
/** Webクリップ */
export let webClip: WebClip | null = null;
</script>

{#if noteMD || rssItem || webClip}
	{@const content = noteMD?.content || rssItem?.content || webClip?.content || ""}
	{@const renderedContent = content ? marked.parse(content) : ""}
	<div class="note-content markdown-preview">{@html renderedContent}</div>
{/if}

<style>
	.note-content {
		margin-top: 1.5rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}
</style>






