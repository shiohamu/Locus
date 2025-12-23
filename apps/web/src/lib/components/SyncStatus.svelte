<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import * as storage from "$lib/storage";

	let syncing = false;
	let lastSync: number | null = null;
	let error: string | null = null;
	let autoSyncInterval: number | null = null;
	let initialized = false;

	onMount(async () => {
		try {
			await loadLastSync();
		} catch (e) {
			console.error("Failed to load last sync:", e);
		} finally {
			initialized = true;
		}
		// 自動同期を有効化（5分ごと）
		autoSyncInterval = window.setInterval(async () => {
			if (navigator.onLine && !syncing && initialized) {
				try {
					// 自動同期はpullSyncのみ（pushSyncは手動のみ）
					const { pullSync } = await import("$lib/sync");
					await pullSync();
					await loadLastSync();
				} catch (e) {
					console.error("Auto sync failed:", e);
					// エラーが発生してもUIは表示し続ける
				}
			}
		}, 5 * 60 * 1000);
	});

	onDestroy(() => {
		if (autoSyncInterval !== null) {
			clearInterval(autoSyncInterval);
		}
	});

	async function loadLastSync() {
		try {
			lastSync = await storage.getLastSync();
		} catch (e) {
			console.error("Failed to get last sync:", e);
			lastSync = null;
		}
	}

	async function handleSync() {
		if (syncing) return;

		syncing = true;
		error = null;

		try {
			const { sync } = await import("$lib/sync");
			const result = await sync();
			await loadLastSync();
			console.log("Sync completed:", result);
		} catch (e) {
			error = e instanceof Error ? e.message : "同期に失敗しました";
			console.error("Sync failed:", e);
			// エラーが発生してもUIは表示し続ける
		} finally {
			syncing = false;
		}
	}

	function formatDate(timestamp: number | null): string {
		if (!timestamp) return "未同期";
		const date = new Date(timestamp * 1000);
		return date.toLocaleString("ja-JP");
	}
</script>

{#if initialized}
	<div class="sync-status">
		<div class="status-info">
			<span class="label">最終同期:</span>
			<span class="value">{formatDate(lastSync)}</span>
		</div>
		<button on:click={handleSync} disabled={syncing || !navigator.onLine}>
			{syncing ? "同期中..." : "同期"}
		</button>
		{#if error}
			<span class="error">{error}</span>
		{/if}
		{#if !navigator.onLine}
			<span class="offline">オフライン</span>
		{/if}
	</div>
{:else}
	<div class="sync-status">
		<div class="status-info">
			<span class="label">初期化中...</span>
		</div>
	</div>
{/if}

<style>
	.sync-status {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.status-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		color: #6b7280;
	}

	.value {
		color: #111827;
		font-weight: 500;
	}

	button {
		padding: 0.5rem 1rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
	}

	button:hover:not(:disabled) {
		background: #4f46e5;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		color: #ef4444;
		font-size: 0.75rem;
	}

	.offline {
		color: #f59e0b;
		font-size: 0.75rem;
		font-weight: 500;
	}
</style>

