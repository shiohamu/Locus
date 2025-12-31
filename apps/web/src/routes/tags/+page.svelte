<script lang="ts">
import { goto } from "$app/navigation";
import { createTag, deleteTag, getTags } from "$lib/api";
import { apiCache } from "$lib/api/cache";
import TagManager from "$lib/components/TagManager.svelte";
import { notesStore } from "$lib/stores/notes";
import type { Tag } from "$lib/types";
import { generateId } from "$lib/utils";
import { onMount } from "svelte";

let tags: Tag[] = [];
let loading = true;
let error: string | null = null;
let creating = false;
let deleting = false;

onMount(async () => {
  await loadTags(true); // 初回読み込み時のみloadingを表示
});

async function loadTags(showLoading = false) {
  if (showLoading) {
    loading = true;
  }
  error = null;
  try {
    // 新しい配列参照を作成してリアクティビティを確実にトリガー
    const fetchedTags = await getTags();
    tags = [...fetchedTags];
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの読み込みに失敗しました";
  } finally {
    if (showLoading) {
      loading = false;
    }
  }
}

async function handleCreateTag(name: string | unknown) {
  error = null;
  creating = true;

  // 型チェック
  if (typeof name !== "string") {
    error = "タグ名が不正です";
    creating = false;
    return;
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    error = "タグ名を入力してください";
    creating = false;
    return;
  }

  try {
    const newTag = await createTag({ name: trimmedName });
    // タグ関連のキャッシュを無効化
    apiCache.deletePattern("/tags");
    // 作成成功後、即座にローカルリストに追加
    tags = [...tags, newTag];
    // その後、サーバーから最新の状態を取得
    await loadTags();
    return newTag;
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの作成に失敗しました";
    // エラー時は再読み込みして状態を同期
    await loadTags();
  } finally {
    creating = false;
  }
}

async function handleDeleteTag(tagId: string | unknown) {
  error = null;
  deleting = true;

  // 型チェック
  if (typeof tagId !== "string") {
    error = "タグIDが不正です";
    deleting = false;
    return;
  }

  try {
    await deleteTag(tagId);
    // タグ関連のキャッシュを無効化
    apiCache.deletePattern("/tags");
    // 削除成功後、即座にローカルリストから削除（新しい配列参照を作成）
    tags = tags.filter((tag) => tag.id !== tagId);
    // その後、サーバーから最新の状態を取得
    await loadTags();
  } catch (e) {
    error = e instanceof Error ? e.message : "タグの削除に失敗しました";
    // エラー時は再読み込みして状態を同期
    await loadTags();
  } finally {
    deleting = false;
  }
}

function handleTagClick(tagName: string) {
  // ホームページに遷移し、タグフィルターを適用
  notesStore.setTagFilter([tagName]);
  goto("/");
}
</script>

<h1>タグ管理</h1>

{#if loading}
	<p>読み込み中...</p>
{:else}
	{#if error}
		<p class="error">エラー: {error}</p>
	{/if}
	<TagManager
		{tags}
		{creating}
		{deleting}
		clickable={true}
		on:create={(e) => handleCreateTag(e.detail)}
		on:delete={(e) => handleDeleteTag(e.detail)}
		on:click={(e) => handleTagClick(e.detail)}
	/>
{/if}

