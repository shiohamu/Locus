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
		gap: 1rem;
		padding: 1rem;
		background-color: #f0f0f0;
		border-bottom: 1px solid #ddd;
	}

	nav a {
		color: #333;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	nav a:hover {
		background-color: #e0e0e0;
	}

	nav a.active {
		background-color: #007bff;
		color: white;
	}
</style>


