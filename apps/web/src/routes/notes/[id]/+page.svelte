<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { deleteNote, getNote, getNoteMD, getRSSItem, getWebClip, updateNoteMD } from "$lib/api";
import NoteEditor from "$lib/components/NoteEditor.svelte";
import NoteLinks from "$lib/components/NoteLinks.svelte";
import NoteTags from "$lib/components/NoteTags.svelte";
import type { NoteCore, NoteMD, RSSItem, WebClip } from "$lib/types";
import { nowTimestamp } from "$lib/utils";
import { marked } from "marked";
import { onMount } from "svelte";

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
let error: string | null = null;
let showPreview = false;
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedTitle = "";
let lastSavedContent = "";

$: noteId = $page.params.id;

onMount(async () => {
  await loadNote();
});

async function loadNote() {
  loading = true;
  error = null;
  try {
    note = await getNote(noteId);
    if (!note) {
      error = "ノートが見つかりません";
      return;
    }

    if (note.type === "md") {
      noteMD = await getNoteMD(noteId);
      if (noteMD) {
        title = note.title;
        content = noteMD.content;
      }
    } else if (note.type === "rss") {
      rssItem = await getRSSItem(noteId);
      if (rssItem) {
        content = rssItem.content;
      }
    } else if (note.type === "web_clip") {
      const clipData = await getWebClip(noteId);
      if (clipData) {
        webClip = clipData;
        content = webClip.content;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "ノートの読み込みに失敗しました";
  } finally {
    loading = false;
  }
}

async function handleSave(silent = false) {
  if (!note || !noteMD) return;

  // 変更がない場合は保存しない
  if (title.trim() === lastSavedTitle && content === lastSavedContent) {
    return;
  }

  if (!silent) {
    saving = true;
  }
  error = null;

  try {
    const updatedCore: NoteCore = {
      ...note,
      title: title.trim(),
      updated_at: nowTimestamp(),
    };

    const updatedMD: NoteMD = {
      ...noteMD,
      content: content,
    };

    await updateNoteMD(noteId, { core: updatedCore, md: updatedMD });
    lastSavedTitle = title.trim();
    lastSavedContent = content;

    if (!silent) {
      editing = false;
      await loadNote();
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "ノートの更新に失敗しました";
  } finally {
    if (!silent) {
      saving = false;
    }
  }
}

function scheduleAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  autoSaveTimer = setTimeout(() => {
    handleSave(true);
  }, 3000); // 3秒後に自動保存
}

$: if (editing && (title !== lastSavedTitle || content !== lastSavedContent)) {
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
    error = e instanceof Error ? e.message : "ノートの削除に失敗しました";
  } finally {
    deleting = false;
  }
}

function startEdit() {
  if (note && noteMD) {
    title = note.title;
    content = noteMD.content;
    lastSavedTitle = note.title;
    lastSavedContent = noteMD.content;
    editing = true;
  }
}

function cancelEdit() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  editing = false;
  if (note && noteMD) {
    title = note.title;
    content = noteMD.content;
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("ja-JP");
}

$: renderedContent = noteMD?.content
  ? marked.parse(noteMD.content)
  : rssItem?.content
    ? marked.parse(rssItem.content)
    : webClip?.content
      ? marked.parse(webClip.content)
      : "";
</script>

{#if loading}
	<p>読み込み中...</p>
{:else if error}
	<p class="error">エラー: {error}</p>
{:else if note && (noteMD || rssItem || webClip)}
	<div class="note-page">
		<div class="note-header">
			{#if editing && note.type === "md"}
				<input
					type="text"
					bind:value={title}
					placeholder="タイトル"
					class="title-input"
				/>
			{:else}
				<h1>{note.title}</h1>
			{/if}

			<div class="actions">
				{#if editing && note.type === "md"}
					<button on:click={handleSave} disabled={saving}>
						{saving ? "保存中..." : "保存"}
					</button>
					<button on:click={cancelEdit} disabled={saving}>
						キャンセル
					</button>
				{:else}
					{#if note.type === "md"}
						<button on:click={startEdit}>編集</button>
					{/if}
					<button on:click={handleDelete} disabled={deleting}>
						{deleting ? "削除中..." : "削除"}
					</button>
				{/if}
			</div>
		</div>

		{#if rssItem}
			<div class="rss-meta">
				<p class="rss-url">
					<a href={rssItem.url} target="_blank" rel="noopener noreferrer">
						{rssItem.url}
					</a>
				</p>
				<p class="rss-date">
					公開日時: {formatDate(rssItem.published_at)}
				</p>
			</div>
		{/if}

		{#if webClip}
			<div class="rss-meta">
				<p class="rss-url">
					<a href={webClip.source_url} target="_blank" rel="noopener noreferrer">
						{webClip.source_url}
					</a>
				</p>
				<p class="rss-date">
					取得日時: {formatDate(webClip.fetched_at)}
				</p>
			</div>
		{/if}

		{#if editing && note.type === "md"}
			<NoteEditor bind:title bind:content bind:showPreview />
			{#if saving}
				<p class="auto-save-indicator">自動保存中...</p>
			{/if}
		{:else}
			<div class="note-content markdown-preview">
				{@html renderedContent}
			</div>
		{/if}

		<NoteTags {noteId} />
		<NoteLinks {noteId} />
	</div>
{/if}

<style>
	.note-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.note-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		gap: 1rem;
	}

	.note-header h1 {
		margin: 0;
		flex: 1;
	}

	.title-input {
		font-size: 1.75rem;
		padding: 0.875rem 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		width: 100%;
		color: #1a1a1a;
		line-height: 1.5;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.2s;
	}

	.title-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	button {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 10px;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9375rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	button:last-child {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	button:last-child:hover:not(:disabled) {
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}

	.note-content {
		margin-top: 1.5rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.markdown-preview {
		font-size: 1rem;
		line-height: 1.8;
		color: #1a1a1a;
	}

	.markdown-preview :global(h1),
	.markdown-preview :global(h2),
	.markdown-preview :global(h3),
	.markdown-preview :global(h4),
	.markdown-preview :global(h5),
	.markdown-preview :global(h6) {
		margin-top: 1.5em;
		margin-bottom: 0.75em;
		font-weight: 600;
		color: #1a1a1a;
	}

	.markdown-preview :global(h1) {
		font-size: 2em;
		border-bottom: 2px solid rgba(99, 102, 241, 0.2);
		padding-bottom: 0.5em;
	}

	.markdown-preview :global(h2) {
		font-size: 1.5em;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		padding-bottom: 0.5em;
	}

	.markdown-preview :global(p) {
		margin: 1em 0;
	}

	.markdown-preview :global(ul),
	.markdown-preview :global(ol) {
		margin: 1em 0;
		padding-left: 2em;
	}

	.markdown-preview :global(li) {
		margin: 0.5em 0;
	}

	.markdown-preview :global(code) {
		background: rgba(99, 102, 241, 0.1);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
		font-size: 0.9em;
	}

	.markdown-preview :global(pre) {
		background: rgba(99, 102, 241, 0.05);
		padding: 1em;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1em 0;
	}

	.markdown-preview :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-preview :global(blockquote) {
		border-left: 4px solid rgba(99, 102, 241, 0.3);
		padding-left: 1em;
		margin: 1em 0;
		color: #6b7280;
	}

	.markdown-preview :global(a) {
		color: #6366f1;
		text-decoration: none;
	}

	.markdown-preview :global(a:hover) {
		text-decoration: underline;
	}

	.markdown-preview :global(table) {
		border-collapse: collapse;
		width: 100%;
		margin: 1em 0;
	}

	.markdown-preview :global(th),
	.markdown-preview :global(td) {
		border: 1px solid rgba(99, 102, 241, 0.2);
		padding: 0.5em 1em;
		text-align: left;
	}

	.markdown-preview :global(th) {
		background: rgba(99, 102, 241, 0.1);
		font-weight: 600;
	}

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

	.auto-save-indicator {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-style: italic;
		text-align: right;
	}
</style>

