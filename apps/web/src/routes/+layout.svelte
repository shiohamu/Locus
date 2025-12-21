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
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding: 1rem;
	}
</style>


