<script lang="ts">
	let { children } = $props();
</script>

<h1>Microsandbox Web UI</h1>
<nav>
	<a href="/">Login</a>
	<a href="/about">About</a>
</nav>

{@render children()}
