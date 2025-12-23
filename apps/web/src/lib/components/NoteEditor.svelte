<script lang="ts">
	import { marked } from "marked";

	export let title: string;
	export let content: string;
	export let showPreview = false;

	$: previewHtml = marked.parse(content || "");
</script>

<div class="editor">
	<div class="editor-section">
		<label for="title">タイトル</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			placeholder="ノートのタイトル"
			class="title-input"
		/>
	</div>

	<div class="editor-section">
		<div class="content-header">
			<label for="content">内容（Markdown）</label>
			<button
				class="preview-toggle"
				on:click={() => (showPreview = !showPreview)}
				type="button"
			>
				{showPreview ? "編集" : "プレビュー"}
			</button>
		</div>
		{#if showPreview}
			<div class="preview content-area">
				{@html previewHtml}
			</div>
		{:else}
			<textarea
				id="content"
				bind:value={content}
				placeholder="Markdown形式で記述してください"
				class="content-textarea"
			/>
		{/if}
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.editor-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		font-weight: 600;
		font-size: 1rem;
		color: #1a1a1a;
		margin-bottom: 0.25rem;
	}

	.title-input {
		padding: 0.875rem 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		font-size: 1.25rem;
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

	.content-textarea {
		padding: 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		min-height: 500px;
		font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
		font-size: 1rem;
		line-height: 1.8;
		color: #1a1a1a;
		resize: vertical;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.2s;
	}

	.content-textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.preview-toggle {
		padding: 0.5rem 1rem;
		background: rgba(99, 102, 241, 0.1);
		color: #6366f1;
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.preview-toggle:hover {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.3);
	}

	.content-area {
		padding: 1.25rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		min-height: 500px;
		background: rgba(255, 255, 255, 0.9);
		overflow-y: auto;
	}

	.preview {
		font-size: 1rem;
		line-height: 1.8;
		color: #1a1a1a;
	}

	.preview :global(h1),
	.preview :global(h2),
	.preview :global(h3),
	.preview :global(h4),
	.preview :global(h5),
	.preview :global(h6) {
		margin-top: 1.5em;
		margin-bottom: 0.75em;
		font-weight: 600;
		color: #1a1a1a;
	}

	.preview :global(h1) {
		font-size: 2em;
		border-bottom: 2px solid rgba(99, 102, 241, 0.2);
		padding-bottom: 0.5em;
	}

	.preview :global(h2) {
		font-size: 1.5em;
		border-bottom: 1px solid rgba(99, 102, 241, 0.1);
		padding-bottom: 0.5em;
	}

	.preview :global(p) {
		margin: 1em 0;
	}

	.preview :global(ul),
	.preview :global(ol) {
		margin: 1em 0;
		padding-left: 2em;
	}

	.preview :global(li) {
		margin: 0.5em 0;
	}

	.preview :global(code) {
		background: rgba(99, 102, 241, 0.1);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
		font-size: 0.9em;
	}

	.preview :global(pre) {
		background: rgba(99, 102, 241, 0.05);
		padding: 1em;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1em 0;
	}

	.preview :global(pre code) {
		background: none;
		padding: 0;
	}

	.preview :global(blockquote) {
		border-left: 4px solid rgba(99, 102, 241, 0.3);
		padding-left: 1em;
		margin: 1em 0;
		color: #6b7280;
	}

	.preview :global(a) {
		color: #6366f1;
		text-decoration: none;
	}

	.preview :global(a:hover) {
		text-decoration: underline;
	}

	.preview :global(table) {
		border-collapse: collapse;
		width: 100%;
		margin: 1em 0;
	}

	.preview :global(th),
	.preview :global(td) {
		border: 1px solid rgba(99, 102, 241, 0.2);
		padding: 0.5em 1em;
		text-align: left;
	}

	.preview :global(th) {
		background: rgba(99, 102, 241, 0.1);
		font-weight: 600;
	}
</style>

