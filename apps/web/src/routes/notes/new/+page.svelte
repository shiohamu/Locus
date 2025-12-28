<script lang="ts">
import { goto } from "$app/navigation";
import { createNoteMD } from "$lib/api";
import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
import NoteEditor from "$lib/components/NoteEditor.svelte";
import type { NoteCore, NoteMD } from "$lib/types";
import { generateId, nowTimestamp } from "$lib/utils";

let title = "";
let content = "";
let saving = false;
let error: unknown | null = null;

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
    error = e;
  } finally {
    saving = false;
  }
}
</script>

<h1>新規ノート作成</h1>

<ErrorDisplay {error} defaultMessage="ノートの作成に失敗しました" />

<NoteEditor bind:title bind:content />

<div class="actions">
	<button class="btn-primary" on:click={handleSave} disabled={saving || !title.trim()}>
		{saving ? "保存中..." : "保存"}
	</button>
	<button class="btn-secondary" on:click={() => goto("/")}>キャンセル</button>
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

</style>

