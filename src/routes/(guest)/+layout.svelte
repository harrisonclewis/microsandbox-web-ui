<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<h1>Microsandbox Web UI</h1>
<nav>
	<a href="/">Login</a>
	<a href="/about">About</a>
</nav>

{@render children()}
