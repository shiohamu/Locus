<script lang="ts">
import { getJSONExportUrl, getMarkdownExportUrl } from "$lib/api";

function handleMarkdownExport() {
  const url = getMarkdownExportUrl();
  const link = document.createElement("a");
  link.href = url;
  link.download = "locus-export.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleJSONExport() {
  const url = getJSONExportUrl();
  const link = document.createElement("a");
  link.href = url;
  link.download = "locus-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<h1>設定</h1>

<div class="settings-section">
	<h2>エクスポート</h2>
	<p>データをエクスポートしてバックアップを作成できます。</p>

	<div class="export-options">
		<div class="export-option">
			<h3>Markdown形式</h3>
			<p>すべてのノートをMarkdownファイルとしてZIP形式でエクスポートします。</p>
			<button on:click={handleMarkdownExport}>Markdownエクスポート</button>
		</div>

		<div class="export-option">
			<h3>JSON形式</h3>
			<p>すべてのデータをJSON形式でエクスポートします。</p>
			<button on:click={handleJSONExport}>JSONエクスポート</button>
		</div>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.settings-section {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.settings-section h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.settings-section p {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.export-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.export-option {
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.export-option h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.export-option p {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.export-option button {
		padding: 0.75rem 1.5rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.export-option button:hover {
		background: #4f46e5;
	}
</style>

