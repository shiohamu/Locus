<script lang="ts">
	export let title: string;
	export let content: string;
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
		<label for="content">内容（Markdown）</label>
		<textarea
			id="content"
			bind:value={content}
			placeholder="Markdown形式で記述してください"
			class="content-textarea"
		/>
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
</style>

