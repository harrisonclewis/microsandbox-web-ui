<script lang="ts">
	import { page } from '$app/state';
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import SdkGuestEventsGate from '$lib/components/sdk/SdkGuestEventsGate.svelte';
	import { getSandboxRunsContext } from './data.remote';

	let { children } = $props();

	const ctx = getSandboxRunsContext();

	const sbName = $derived(ctx.current?.sandbox.name ?? '');
	const sbId = $derived(ctx.current?.sandbox.id ?? '');
	const runsBase = $derived(`/sandboxes/${page.params.sandboxId}/runs`);
	const path = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>Sandbox Runs | Microsandbox Web UI</title>
</svelte:head>

<SdkUrlFeedback />

<h1>Sandbox Runs</h1>

<SdkGuestEventsGate />

{#if ctx.error}
	<p>Unable to load sandbox.</p>
{:else if ctx.loading}
	<p>Loading sandbox…</p>
{:else if !ctx.current?.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<ul>
		<li>Sandbox: <a href={`/sandboxes/${sbId}`}>{sbName}</a></li>
		<li><a href={`/sandboxes/${sbId}/files`}>Files</a></li>
		<li>Status: {ctx.current.sandbox.status}</li>
	</ul>

	<nav aria-label="Run tools">
		<ul>
			<li>
				<a href={runsBase} aria-current={path === runsBase ? 'page' : undefined}>History</a>
			</li>
			<li>
				<a href="{runsBase}/exec" aria-current={path === `${runsBase}/exec` ? 'page' : undefined}
					>Command</a
				>
			</li>
			<li>
				<a href="{runsBase}/shell" aria-current={path === `${runsBase}/shell` ? 'page' : undefined}
					>Shell script</a
				>
			</li>
			<li>
				<a href="{runsBase}/config" aria-current={path === `${runsBase}/config` ? 'page' : undefined}
					>Full options</a
				>
			</li>
			<li>
				<a
					href="{runsBase}/stream"
					aria-current={path === `${runsBase}/stream` ? 'page' : undefined}>Streaming</a
				>
			</li>
		</ul>
	</nav>

	{@render children()}
{/if}
