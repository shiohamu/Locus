<script lang="ts">
import { page } from "$app/stores";
</script>

<nav>
	<a href="/" class:active={$page.url.pathname === "/"}>ホーム</a>
	<a href="/notes/new" class:active={$page.url.pathname === "/notes/new"}>新規ノート</a>
	<a href="/tags" class:active={$page.url.pathname === "/tags"}>タグ</a>
	<a href="/rss" class:active={$page.url.pathname === "/rss"}>RSS</a>
	<a href="/search" class:active={$page.url.pathname === "/search"}>検索</a>
</nav>

<style>
	nav {
		display: flex;
		gap: 0.5rem;
		padding: 1.25rem 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
	}

	nav a {
		color: #4a4a4a;
		text-decoration: none;
		padding: 0.625rem 1.25rem;
		border-radius: 10px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 500;
		font-size: 0.9375rem;
		position: relative;
	}

	nav a:hover {
		background: rgba(99, 102, 241, 0.1);
		color: #6366f1;
		transform: translateY(-1px);
	}

	nav a.active {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	nav a.active:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
	}
</style>


