<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { deleteNote } from "$lib/api";
import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
import NoteActions from "$lib/components/NoteActions.svelte";
import NoteEdit from "$lib/components/NoteEdit.svelte";
import NoteHeader from "$lib/components/NoteHeader.svelte";
import FileEmbedder from "$lib/components/FileEmbedder.svelte";
import NoteLinks from "$lib/components/NoteLinks.svelte";
import NoteMeta from "$lib/components/NoteMeta.svelte";
import NoteSummary from "$lib/components/NoteSummary.svelte";
import NoteTags from "$lib/components/NoteTags.svelte";
import NoteView from "$lib/components/NoteView.svelte";
import { AutoSaveManager } from "$lib/hooks/useAutoSave";
import { loadNoteData, saveNoteData } from "$lib/hooks/useNote";
import { generateNoteSummary } from "$lib/hooks/useNoteSummary";
import type { NoteCore, NoteMD, RSSItem, WebClip } from "$lib/types";
import { onDestroy, onMount } from "svelte";

let note: NoteCore | null = null;
let noteMD: NoteMD | null = null;
let rssItem: RSSItem | null = null;
let webClip: WebClip | null = null;
let editing = false;
let title = "";
let content = "";
let loading = true;
let saving = false;
let deleting = false;
let error: unknown | null = null;
let showPreview = false;
let summary: string | null = null;
let summarizing = false;
let showSummary = false;

let autoSaveManager: AutoSaveManager | null = null;

$: noteId = $page.params.id;

onMount(async () => {
  autoSaveManager = new AutoSaveManager();
  await loadNote();
});

onDestroy(() => {
  autoSaveManager?.destroy();
});

async function loadNote() {
  loading = true;
  error = null;
  const result = await loadNoteData(noteId);
  note = result.note;
  noteMD = result.noteMD;
  rssItem = result.rssItem;
  webClip = result.webClip;
  error = result.error;

  if (note) {
    title = note.title;
    if (note.type === "md" && noteMD) {
      content = noteMD.content;
      autoSaveManager?.updateSavedState(title, content);
    } else if (note.type === "rss" && rssItem) {
      content = rssItem.content || "";
      autoSaveManager?.updateSavedState(title, content);
    } else if (note.type === "web_clip" && webClip) {
      content = webClip.content || "";
    }
  }

  loading = false;
}

async function handleSave(silent = false) {
  if (!note) return;
  if (note.type === "md" && !noteMD) return;
  if (note.type === "rss" && !rssItem) return;

  if (!silent) {
    saving = true;
  }
  error = null;

  try {
    await saveNoteData(noteId, note, noteMD, rssItem, title, content);
    autoSaveManager?.updateSavedState(title, content);

    if (!silent) {
      editing = false;
      await loadNote();
    }
  } catch (e) {
    error = e;
  } finally {
    if (!silent) {
      saving = false;
    }
  }
}

function scheduleAutoSave() {
  if (editing && note && noteMD) {
    autoSaveManager?.schedule(title, content, (t, c) => handleSave(true));
  }
}

$: if (editing && (title !== note?.title || content !== noteMD?.content)) {
  scheduleAutoSave();
}

async function handleDelete() {
  if (!confirm("このノートを削除しますか？")) return;

  deleting = true;
  error = null;

  try {
    await deleteNote(noteId);
    goto("/");
  } catch (e) {
    error = e;
  } finally {
    deleting = false;
  }
}

function startEdit() {
  if (!note) return;

  title = note.title;
  if (note.type === "md" && noteMD) {
    content = noteMD.content;
  } else if (note.type === "rss" && rssItem) {
    content = rssItem.content || "";
  } else if (note.type === "web_clip" && webClip) {
    content = webClip.content || "";
  }

  autoSaveManager?.updateSavedState(title, content);
  editing = true;
}

function cancelEdit() {
  autoSaveManager?.clear();
  editing = false;
  if (!note) return;

  title = note.title;
  if (note.type === "md" && noteMD) {
    content = noteMD.content;
  } else if (note.type === "rss" && rssItem) {
    content = rssItem.content || "";
  } else if (note.type === "web_clip" && webClip) {
    content = webClip.content || "";
  }
}

async function handleSummarize() {
  if (!note) return;

  summarizing = true;
  error = null;
  try {
    summary = await generateNoteSummary(noteId, note.type);
    showSummary = true;
  } catch (e) {
    error = e;
  } finally {
    summarizing = false;
  }
}

$: hasContent = !!(noteMD?.content || rssItem?.content || webClip?.content);
</script>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<ErrorDisplay {error} defaultMessage="ノートの読み込みに失敗しました" />
{:else if note && (noteMD || rssItem || webClip)}
	<div class="note-page">
		<div class="note-header-container">
			<NoteHeader {note} {editing} bind:title />
			<NoteActions
				{note}
				{editing}
				{saving}
				{deleting}
				{summarizing}
				{hasContent}
				onEdit={startEdit}
				onSave={() => handleSave(false)}
				onCancel={cancelEdit}
				onDelete={handleDelete}
				onSummarize={handleSummarize}
			/>
		</div>

		<NoteMeta {rssItem} {webClip} />

		<NoteSummary {summary} show={showSummary} onClose={() => (showSummary = false)} />

		{#if editing && (note.type === "md" || note.type === "rss")}
			<NoteEdit bind:title bind:content bind:showPreview {saving} />
		{:else}
			<NoteView {noteMD} {rssItem} {webClip} />
		{/if}

		<NoteTags {noteId} />
		<NoteLinks {noteId} />
		<FileEmbedder {noteId} />
	</div>
{/if}

<style>
	.note-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.note-header-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}
</style>
