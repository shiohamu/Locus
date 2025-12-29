<script lang="ts">
import type { RSSItem, WebClip } from "$lib/types";
import { formatDate } from "$lib/utils";

/** RSSアイテム */
export let rssItem: RSSItem | null = null;
/** Webクリップ */
export let webClip: WebClip | null = null;
</script>

{#if rssItem}
	<div class="rss-meta">
		<p class="rss-url">
			<a href={rssItem.url} target="_blank" rel="noopener noreferrer">
				{rssItem.url}
			</a>
		</p>
		<p class="rss-date">公開日時: {formatDate(rssItem.published_at)}</p>
	</div>
{/if}

{#if webClip}
	<div class="rss-meta">
		<p class="rss-url">
			<a href={webClip.source_url} target="_blank" rel="noopener noreferrer">
				{webClip.source_url}
			</a>
		</p>
		<p class="rss-date">取得日時: {formatDate(webClip.fetched_at)}</p>
	</div>
{/if}

<style>
	.rss-meta {
		margin-bottom: 1.5rem;
		padding: 1rem 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.rss-url {
		margin: 0 0 0.5rem 0;
	}

	.rss-url a {
		color: #6366f1;
		text-decoration: none;
		word-break: break-all;
	}

	.rss-url a:hover {
		text-decoration: underline;
	}

	.rss-date {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}
</style>






