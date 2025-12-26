<script lang="ts">
import type { Tag } from "$lib/types";
import { createEventDispatcher } from "svelte";

export let tags: Tag[];
export const creating = false;
export const deleting = false;

const dispatch = createEventDispatcher<{
  create: string;
  delete: string;
}>();

let newTagName = "";
let previousTagsLength = tags.length;
let lastCreatedTagName = "";

// tagsが更新されたら（新しいタグが追加されたら）入力フィールドをクリア
$: if (tags.length > previousTagsLength) {
  previousTagsLength = tags.length;
  // 成功時のみ入力フィールドをクリア
  if (lastCreatedTagName && newTagName.trim() === lastCreatedTagName) {
    newTagName = "";
    lastCreatedTagName = "";
  }
}

// tagsが変更されたらpreviousTagsLengthを更新
$: if (tags.length !== previousTagsLength) {
  previousTagsLength = tags.length;
}

function handleCreate() {
  const trimmed = newTagName.trim();
  if (!trimmed || creating) {
    return;
  }

  lastCreatedTagName = trimmed;
  // dispatchは同期的なので、親コンポーネントのハンドラーを呼び出す
  dispatch("create", trimmed);
}

function handleDelete(tagId: string) {
  if (!confirm("このタグを削除しますか？")) {
    return;
  }
  dispatch("delete", tagId);
}
</script>

<div class="tag-manager">
	<div class="create-section">
		<h2>新規タグ作成</h2>
		<div class="create-form">
			<input
				type="text"
				bind:value={newTagName}
				placeholder="タグ名を入力"
				on:keydown={(e) => e.key === "Enter" && handleCreate()}
				disabled={creating}
			/>
			<button on:click={handleCreate} disabled={creating || !newTagName.trim()}>
				{creating ? "作成中..." : "作成"}
			</button>
		</div>
	</div>

	<div class="tags-section">
		<h2>タグ一覧 ({tags.length})</h2>
		{#if tags.length === 0}
			<p>タグがありません</p>
		{:else}
			<div class="tags-list">
				{#each tags as tag (tag.id)}
					<span class="tag-item">
						{tag.name}
						<button
							class="delete-btn"
							on:click={() => handleDelete(tag.id)}
							disabled={deleting}
							title="タグを削除"
						>
							×
						</button>
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.tag-manager {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.create-section,
	.tags-section {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.create-form {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.create-form input {
		flex: 1;
		padding: 0.75rem 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		font-size: 1rem;
		color: #1a1a1a;
		line-height: 1.5;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.2s;
	}

	.create-form input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.create-form button {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.create-form button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.create-form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.tag-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
		border-radius: 12px;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #6366f1;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
		transition: all 0.2s;
	}

	.tag-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
	}

	.delete-btn {
		background: none;
		border: none;
		color: #6366f1;
		cursor: pointer;
		font-size: 1.25rem;
		line-height: 1;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.delete-btn:hover:not(:disabled) {
		background-color: rgba(99, 102, 241, 0.15);
		transform: scale(1.1);
		color: #4f46e5;
	}

	.delete-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

