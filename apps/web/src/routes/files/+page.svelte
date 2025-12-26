<script lang="ts">
import { deleteFile, getFiles, uploadFile } from "$lib/api";
import type { File } from "@locus/shared";
import { onMount } from "svelte";

let files: File[] = [];
let loading = true;
let error: string | null = null;
let uploading = false;

onMount(async () => {
  await loadFiles();
});

async function loadFiles() {
  loading = true;
  error = null;
  try {
    files = await getFiles();
  } catch (e) {
    error = e instanceof Error ? e.message : "ファイルの読み込みに失敗しました";
  } finally {
    loading = false;
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  error = null;
  uploading = true;
  try {
    await uploadFile(file);
    await loadFiles();
    input.value = "";
  } catch (e) {
    error = e instanceof Error ? e.message : "ファイルのアップロードに失敗しました";
  } finally {
    uploading = false;
  }
}

async function handleDeleteFile(fileId: string) {
  if (!confirm("このファイルを削除しますか？")) {
    return;
  }

  error = null;
  try {
    await deleteFile(fileId);
    await loadFiles();
  } catch (e) {
    error = e instanceof Error ? e.message : "ファイルの削除に失敗しました";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("ja-JP");
}

function getFileDownloadUrl(id: string): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
  return `${API_BASE_URL}/files/${id}/download`;
}
</script>

<h1>ファイル管理</h1>

{#if error}
	<p class="error">エラー: {error}</p>
{/if}

<div class="upload-section">
	<label for="file-input" class="upload-button" class:uploading>
		{uploading ? "アップロード中..." : "ファイルを選択"}
		<input
			id="file-input"
			type="file"
			on:change={handleFileUpload}
			disabled={uploading}
			style="display: none;"
		/>
	</label>
</div>

{#if loading}
	<p>読み込み中...</p>
{:else if files.length === 0}
	<p>ファイルが登録されていません</p>
{:else}
	<ul class="file-list">
		{#each files as file}
			<li>
				<div class="file-info">
					<h3>{file.filename}</h3>
					<p class="meta">
						{file.mime_type} • {formatFileSize(file.size)} • {formatDate(file.created_at)}
					</p>
				</div>
				<div class="file-actions">
					<a href={getFileDownloadUrl(file.id)} download={file.filename} class="download-button">
						ダウンロード
					</a>
					<button on:click={() => handleDeleteFile(file.id)}>削除</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.upload-section {
		margin-bottom: 1.5rem;
	}

	.upload-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.upload-button:hover:not(.uploading) {
		background: #4f46e5;
	}

	.upload-button.uploading {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.file-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.file-list li {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.file-info {
		flex: 1;
	}

	.file-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.file-info .meta {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.file-actions {
		display: flex;
		gap: 0.5rem;
	}

	.download-button {
		padding: 0.5rem 1rem;
		background: #6366f1;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.download-button:hover {
		background: #4f46e5;
	}

	.file-actions button {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.file-actions button:hover {
		background: #e5e7eb;
	}

	.error {
		color: #ef4444;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #fef2f2;
		border-radius: 6px;
	}
</style>

