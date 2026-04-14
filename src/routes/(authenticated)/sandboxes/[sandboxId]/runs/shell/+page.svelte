<script lang="ts">
	import { getSandboxRunsContext } from '../data.remote';
	import { runShell } from '../actions.remote';

	const ctx = getSandboxRunsContext();

	let script = $state('pwd && ls -la');

	const sbName = $derived(ctx.current?.sandbox.name ?? '');
</script>

<svelte:head>
	<title>Run shell script | Microsandbox Web UI</title>
</svelte:head>

<div>
	{#if ctx.current?.sandbox}
		<fieldset>
			<legend>Run shell script (buffered)</legend>
			<p>Runs a script with the sandbox default shell (multi-line OK).</p>
			<form {...runShell}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<label>Script <textarea name="script" bind:value={script} rows="3"></textarea></label>
				<button type="submit" disabled={runShell.pending > 0}>Run shell</button>
			</form>
		</fieldset>
	{/if}
</div>
