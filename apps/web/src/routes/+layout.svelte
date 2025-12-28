<script lang="ts">
import Nav from "$lib/components/Nav.svelte";
import SyncStatus from "$lib/components/SyncStatus.svelte";
import ErrorBoundary from "$lib/components/ErrorBoundary.svelte";
import { onMount } from "svelte";
// 共通スタイルのインポート
import "$lib/styles/buttons.css";
import "$lib/styles/markdown.css";
import "$lib/styles/errors.css";
import "$lib/styles/forms.css";

onMount(() => {
  // 開発環境ではService Workerを無効化（ホットリロードの問題を回避）
  if (import.meta.env.DEV) {
    // 開発環境では既存のService Workerをアン登録
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
    return;
  }

  // 本番環境でのみService Workerを登録
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
});
</script>

<ErrorBoundary fallback="アプリケーションでエラーが発生しました">
	<div class="app">
		<Nav />
		<div class="sync-container">
			<SyncStatus />
		</div>
		<main>
			<slot />
		</main>
	</div>
</ErrorBoundary>

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
		font-size: 16px;
		line-height: 1.6;
		color: #1a1a1a;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		min-height: 100vh;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.sync-container {
		padding: 0.5rem 2rem;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
	}

	main {
		flex: 1;
		padding: 2rem;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
	}

	:global(h1) {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.2;
		color: #1a1a1a;
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.02em;
	}

	:global(h2) {
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.3;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
		letter-spacing: -0.01em;
	}

	:global(h3) {
		font-size: 1.375rem;
		font-weight: 600;
		line-height: 1.4;
		color: #1a1a1a;
		margin: 0 0 0.75rem 0;
	}

	:global(p) {
		margin: 0 0 1rem 0;
		line-height: 1.7;
		color: #4a4a4a;
	}

	/* エラー表示スタイルは errors.css で定義 */
</style>


