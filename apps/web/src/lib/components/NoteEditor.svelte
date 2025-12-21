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
		gap: 1rem;
	}

	.editor-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: bold;
	}

	.title-input {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1.2rem;
	}

	.content-textarea {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		min-height: 400px;
		font-family: monospace;
		font-size: 0.9rem;
		resize: vertical;
	}
</style>

