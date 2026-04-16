<script lang="ts" generics="T">
	import type { RemoteResource } from "@sveltejs/kit";
	import type { Snippet } from "svelte";

	type Props = {
		remote: RemoteResource<T>;
		children?: Snippet<[RemoteResource<T>]>;
		loading?: Snippet;
		error?: Snippet<[unknown]>;
		empty?: Snippet;
		isEmpty?: (value: T | undefined) => boolean;
		loadingText?: string;
		errorText?: string;
		emptyText?: string;
	};

	let {
		remote,
		children,
		loading,
		error,
		loadingText = "Loading",
		errorText = "Error",
	}: Props = $props();
</script>

{#if remote.error}
	{#if error}
		{@render error(remote.error)}
	{:else}
		<p>{errorText}</p>
	{/if}
{:else if remote.loading}
	{#if loading}
		{@render loading()}
	{:else}
		<p>{loadingText}</p>
	{/if}
{:else if children}
	{@render children(remote)}
{/if}