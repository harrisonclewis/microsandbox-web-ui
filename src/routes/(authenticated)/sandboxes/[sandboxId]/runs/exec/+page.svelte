<script lang="ts">
	import StructuredJsonField from '$lib/components/forms/StructuredJsonField.svelte';
	import { stringArrayArgsSpec } from '$lib/json-fields/definitions.js';
	import { getSandboxRunsContext } from '../data.remote';
	import { runExec } from '../actions.remote';

	const ctx = getSandboxRunsContext();

	let cmd = $state('echo');
	let argsJson = $state('["hello"]');

	const sbName = $derived(ctx.current?.sandbox.name ?? '');
</script>

<svelte:head>
	<title>Run command | Microsandbox Web UI</title>
</svelte:head>

<div>
	{#if ctx.current?.sandbox}
		<fieldset>
			<legend>Run command (buffered)</legend>
			<p>
				Runs one executable with a list of arguments—no JSON required in Simple mode.
			</p>
			<form {...runExec}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<label>Program <input type="text" name="cmd" bind:value={cmd} /></label>
				<StructuredJsonField spec={stringArrayArgsSpec} bind:json={argsJson} name="argsJson" />
				<button type="submit" disabled={runExec.pending > 0}>Run</button>
			</form>
		</fieldset>
	{/if}
</div>
