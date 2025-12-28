<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import {
  deleteNote,
  getNote,
  getNoteMD,
  getRSSItem,
  getWebClip,
  summarizeNote,
  summarizeRSSArticle,
  updateNoteMD,
} from "$lib/api";
import NoteEditor from "$lib/components/NoteEditor.svelte";
import NoteLinks from "$lib/components/NoteLinks.svelte";
import NoteTags from "$lib/components/NoteTags.svelte";
import type { NoteCore, NoteMD, RSSItem, WebClip } from "$lib/types";
import { formatDate, nowTimestamp } from "$lib/utils";
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
let summary: string | null = null;
let summarizing = false;
let showSummary = false;

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

$: renderedContent = noteMD?.content
  ? marked.parse(noteMD.content)
  : rssItem?.content
    ? marked.parse(rssItem.content)
    : webClip?.content
      ? marked.parse(webClip.content)
      : "";

async function handleSummarize() {
  if (!note) return;

  summarizing = true;
  error = null;
  try {
    let result: { summary: string };
    if (note.type === "rss") {
      result = await summarizeRSSArticle(noteId);
    } else {
      result = await summarizeNote(noteId);
    }
    summary = result.summary;
    showSummary = true;
  } catch (e) {
    error = e instanceof Error ? e.message : "要約の生成に失敗しました";
  } finally {
    summarizing = false;
  }
}
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
					<button class="btn-primary" on:click={handleSave} disabled={saving}>
						{saving ? "保存中..." : "保存"}
					</button>
					<button class="btn-secondary" on:click={cancelEdit} disabled={saving}>
						キャンセル
					</button>
				{:else}
					<div class="action-group">
						{#if content}
							<button
								class="btn-llm"
								on:click={handleSummarize}
								disabled={summarizing}
								title="AIで要約を生成"
							>
								{summarizing ? "要約中..." : "要約"}
							</button>
						{/if}
						{#if note.type === "md"}
							<button class="btn-primary" on:click={startEdit}>編集</button>
						{/if}
					</div>
					<div class="action-separator"></div>
					<button
						class="btn-danger"
						on:click={handleDelete}
						disabled={deleting}
						title="このノートを削除"
					>
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

		{#if showSummary && summary}
			<div class="llm-section">
				<div class="llm-header">
					<h2>要約</h2>
					<button class="btn-close" on:click={() => (showSummary = false)}>
						×
					</button>
				</div>
				<div class="llm-content markdown-preview">{@html marked.parse(summary)}</div>
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
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.note-header h1 {
		margin: 0;
		word-break: break-word;
		overflow-wrap: break-word;
		line-height: 1.4;
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
		flex-wrap: wrap;
		align-items: center;
		width: 100%;
	}

	.action-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.action-separator {
		width: 1px;
		height: 2rem;
		background: rgba(0, 0, 0, 0.1);
		margin: 0 0.5rem;
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


	.llm-section {
		margin-top: 1.5rem;
		padding: 1.5rem;
		background: rgba(16, 185, 129, 0.05);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
	}

	.llm-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.llm-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #059669;
	}


	.llm-content {
		background: rgba(255, 255, 255, 0.9);
		padding: 1rem;
		border-radius: 8px;
	}
</style>

