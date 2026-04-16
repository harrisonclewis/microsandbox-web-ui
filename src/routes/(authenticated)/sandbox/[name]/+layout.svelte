<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	let { children } = $props();

	const sandboxName = $derived(page.params.name!);
</script>

<h1>
	<a href={resolve(`/sandbox/${encodeURIComponent(sandboxName)}`)}>{sandboxName}</a>
</h1>

{@render children()}
