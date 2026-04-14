<script lang="ts">
	import StructuredJsonField from '$lib/components/forms/StructuredJsonField.svelte';
	import { execConfigSpec } from '$lib/json-fields/definitions.js';
	import { getSandboxRunsContext } from '../data.remote';
	import { runExecWithConfig } from '../actions.remote';

	const ctx = getSandboxRunsContext();

	let execConfigJson = $state(JSON.stringify({ cmd: 'uname', args: ['-a'] }, null, 2));

	const sbName = $derived(ctx.current?.sandbox.name ?? '');
</script>

<svelte:head>
	<title>Run with full options | Microsandbox Web UI</title>
</svelte:head>

<div>
	{#if ctx.current?.sandbox}
		<fieldset>
			<legend>Run with full options</legend>
			<p>
				Same as the SDK <code>execWithConfig</code>: command, args, cwd, env, timeout, stdin, TTY. Use
				<strong>Advanced</strong> for raw JSON.
			</p>
			<form {...runExecWithConfig}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<StructuredJsonField spec={execConfigSpec} bind:json={execConfigJson} name="configJson" />
				<button type="submit" disabled={runExecWithConfig.pending > 0}>Run</button>
			</form>
		</fieldset>
	{/if}
</div>
