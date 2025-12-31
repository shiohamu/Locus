<script lang="ts">
import { getFiles, getFilesByNote, linkFileToNote, unlinkFileFromNote } from "$lib/api";
import type { File } from "@locus/shared";
import { onMount } from "svelte";

/** ノートID */
export let noteId: string;

let allFiles: File[] = [];
let linkedFiles: File[] = [];
let loading = false;
let error: unknown | null = null;
let showFileSelector = false;

onMount(async () => {
  await loadFiles();
});

async function loadFiles() {
  loading = true;
  error = null;
  try {
    [allFiles, linkedFiles] = await Promise.all([getFiles(), getFilesByNote(noteId)]);
  } catch (e) {
    error = e;
  } finally {
    loading = false;
  }
}

async function handleLinkFile(fileId: string) {
  error = null;
  try {
    await linkFileToNote(fileId, noteId);
    await loadFiles();
  } catch (e) {
    error = e;
  }
}

async function handleUnlinkFile(fileId: string) {
  if (!confirm("このファイルとの関連を解除しますか？")) {
    return;
  }

  error = null;
  try {
    await unlinkFileFromNote(fileId, noteId);
    await loadFiles();
  } catch (e) {
    error = e;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

$: availableFiles = allFiles.filter((file) => !linkedFiles.some((linked) => linked.id === file.id));
</script>

<div class="file-embedder">
	<div class="header">
		<h3>埋め込みファイル</h3>
		<button on:click={() => (showFileSelector = !showFileSelector)}>
			{showFileSelector ? "閉じる" : "ファイルを追加"}
		</button>
	</div>

	{#if error}
		<p class="error">エラー: {String(error)}</p>
	{/if}

	{#if loading}
		<p>読み込み中...</p>
	{:else if linkedFiles.length === 0}
		<p class="empty">埋め込みファイルがありません</p>
	{:else}
		<ul class="file-list">
			{#each linkedFiles as file}
				<li>
					<div class="file-info">
						<span class="filename">{file.filename}</span>
						<span class="file-meta">
							{file.mime_type} • {formatFileSize(file.size)}
						</span>
					</div>
					<button
						class="unlink-button"
						on:click={() => handleUnlinkFile(file.id)}
					>
						削除
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if showFileSelector}
		<div class="file-selector">
			<h4>ファイルを選択</h4>
			{#if availableFiles.length === 0}
				<p class="empty">利用可能なファイルがありません</p>
			{:else}
				<ul class="file-list">
					{#each availableFiles as file}
						<li>
							<div class="file-info">
								<span class="filename">{file.filename}</span>
								<span class="file-meta">
									{file.mime_type} • {formatFileSize(file.size)}
								</span>
							</div>
							<button
								class="link-button"
								on:click={() => handleLinkFile(file.id)}
							>
								追加
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.file-embedder {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.header h3 {
		margin: 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.header button {
		padding: 0.5rem 1rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.header button:hover {
		background: #4f46e5;
	}

	.error {
		color: #dc2626;
		font-size: 0.875rem;
		margin: 0.5rem 0;
	}

	.empty {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0.5rem 0;
		font-style: italic;
	}

	.file-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.file-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.file-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filename {
		font-weight: 500;
		color: #111827;
		font-size: 0.875rem;
	}

	.file-meta {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.link-button,
	.unlink-button {
		padding: 0.375rem 0.75rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.75rem;
		transition: background 0.2s;
	}

	.link-button:hover {
		background: #4f46e5;
	}

	.unlink-button {
		background: #ef4444;
	}

	.unlink-button:hover {
		background: #dc2626;
	}

	.file-selector {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.file-selector h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: #111827;
	}
</style>

