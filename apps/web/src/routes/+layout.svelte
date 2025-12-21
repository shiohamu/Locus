<script lang="ts">
	import Nav from "$lib/components/Nav.svelte";
</script>

<div class="app">
	<Nav />
	<main>
		<slot />
	</main>
</div>

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

	:global(.error) {
		color: #d32f2f;
		font-weight: 500;
		margin: 0.5rem 0;
		padding: 1rem 1.25rem;
		background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
		border-left: 4px solid #d32f2f;
		border-radius: 8px;
		line-height: 1.5;
		box-shadow: 0 2px 8px rgba(211, 47, 47, 0.1);
	}
</style>


