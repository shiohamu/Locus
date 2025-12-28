<script lang="ts">
	import { onMount } from "svelte";
	import ErrorDisplay from "./ErrorDisplay.svelte";
	import { logError } from "$lib/utils/logger";
	import "$lib/styles/errors.css";

	/** フォールバックメッセージ */
	export let fallback = "エラーが発生しました";
	/** エラー詳細を表示するか */
	export let showDetails = false;
	/** エラーが発生した場合のコールバック */
	export let onError: ((error: Error) => void) | undefined = undefined;

	let error: Error | null = null;

	onMount(() => {
		// グローバルエラーハンドラーを設定
		const handleError = (event: ErrorEvent) => {
			error = event.error;
			logError(event.error, { context: "ErrorBoundary", source: "error" });
			onError?.(event.error);
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			error =
				event.reason instanceof Error
					? event.reason
					: new Error(String(event.reason));
			logError(error, { context: "ErrorBoundary", source: "unhandledrejection" });
			onError?.(error);
		};

		window.addEventListener("error", handleError);
		window.addEventListener("unhandledrejection", handleRejection);

		return () => {
			window.removeEventListener("error", handleError);
			window.removeEventListener("unhandledrejection", handleRejection);
		};
	});

	function handleReload() {
		window.location.reload();
	}

	function handleReset() {
		error = null;
	}
</script>

{#if error}
	<div class="error-boundary">
		<ErrorDisplay {error} {fallback} />
		{#if showDetails}
			<details class="error-details">
				<summary>エラー詳細</summary>
				<pre class="error-stack">{error.stack}</pre>
			</details>
		{/if}
		<div class="error-actions">
			<button type="button" on:click={handleReset} class="error-button">
				リセット
			</button>
			<button type="button" on:click={handleReload} class="error-button">
				ページを再読み込み
			</button>
		</div>
	</div>
{:else}
	<slot />
{/if}

<style>
	.error-boundary {
		padding: 2rem;
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.error-details {
		margin-top: 1rem;
		text-align: left;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.05);
	}

	.error-details summary {
		cursor: pointer;
		font-weight: 600;
		color: #dc2626;
		margin-bottom: 0.5rem;
	}

	.error-stack {
		font-size: 0.875rem;
		white-space: pre-wrap;
		word-break: break-all;
		color: #6b7280;
		margin: 0;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.error-button {
		padding: 0.625rem 1.25rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.error-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.error-button:active {
		transform: translateY(0);
	}
</style>

