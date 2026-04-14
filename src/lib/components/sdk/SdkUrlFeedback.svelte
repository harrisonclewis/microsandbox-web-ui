<script lang="ts">
	import { page } from '$app/state';

	const notice = $derived(page.url.searchParams.get('notice'));
	const sdkOutRaw = $derived(page.url.searchParams.get('sdkOut'));
	const sdkOut = $derived.by(() => {
		if (!sdkOutRaw) return null;
		try {
			return JSON.parse(sdkOutRaw) as unknown;
		} catch {
			return { parseError: true, raw: sdkOutRaw };
		}
	});
</script>

{#if notice}
	<p role="status">{notice}</p>
{/if}

{#if sdkOut != null}
	<details open>
		<summary>SDK result (from last action)</summary>
		<pre>{JSON.stringify(sdkOut, null, 2)}</pre>
	</details>
{/if}
