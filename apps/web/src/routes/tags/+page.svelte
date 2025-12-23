<script lang="ts">
	import { onMount } from "svelte";
	import type { Tag } from "$lib/types";
	import { getTags, createTag, deleteTag } from "$lib/api";
	import { generateId } from "$lib/utils";
	import TagManager from "$lib/components/TagManager.svelte";

	let tags: Tag[] = [];
	let loading = true;
	let error: string | null = null;
	let creating = false;
	let deleting = false;

	onMount(async () => {
		await loadTags();
	});

	async function loadTags() {
		loading = true;
		error = null;
		try {
			tags = await getTags();
		} catch (e) {
			error = e instanceof Error ? e.message : "タグの読み込みに失敗しました";
		} finally {
			loading = false;
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
			await loadTags();
			return newTag;
		} catch (e) {
			error = e instanceof Error ? e.message : "タグの作成に失敗しました";
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
			await loadTags();
		} catch (e) {
			error = e instanceof Error ? e.message : "タグの削除に失敗しました";
		} finally {
			deleting = false;
		}
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
		on:create={(e) => handleCreateTag(e.detail)}
		on:delete={(e) => handleDeleteTag(e.detail)}
	/>
{/if}

