<script lang="ts">
import type { Tag } from "$lib/types";

export let tags: Tag[];
export const onTagClick: ((tag: Tag) => void) | null = null;
</script>

<div class="tag-list">
	{#if tags.length === 0}
		<p class="empty">タグがありません</p>
	{:else}
		{#each tags as tag (tag.id)}
			{#if onTagClick}
				<button
					class="tag-item clickable"
					on:click={() => onTagClick?.(tag)}
					on:keydown={(e) => e.key === "Enter" && onTagClick?.(tag)}
				>
					{tag.name}
				</button>
			{:else}
				<span class="tag-item">{tag.name}</span>
			{/if}
		{/each}
	{/if}
</div>

<style>
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.tag-item {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
		border-radius: 12px;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #6366f1;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
		transition: all 0.2s;
		border: none;
		cursor: default;
	}

	.tag-item.clickable {
		cursor: pointer;
	}

	.tag-item.clickable:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
	}

	.tag-item.clickable:active {
		transform: translateY(0);
	}

	.empty {
		color: #6b7280;
		font-size: 0.9375rem;
		margin: 0;
	}
</style>







