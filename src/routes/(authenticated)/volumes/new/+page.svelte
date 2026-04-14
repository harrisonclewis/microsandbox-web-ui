<script lang="ts">
	import StructuredJsonField from '$lib/components/forms/StructuredJsonField.svelte';
	import { volumeLabelsSpec } from '$lib/json-fields/definitions.js';
	import { volumeCreate } from '../actions.remote';

	let labelsJson = $state('{}');
</script>

<svelte:head>
	<title>New Volume | Microsandbox Web UI</title>
</svelte:head>

<h1>Create volume</h1>
<p><a href="/volumes">Back to volumes</a> · <a href="/settings/sdk">SDK diagnostics</a></p>

{#if volumeCreate.fields.allIssues()?.length}
	<ul role="alert">
		{#each volumeCreate.fields.allIssues() ?? [] as issue}
			<li>{issue.message}</li>
		{/each}
	</ul>
{/if}

<form {...volumeCreate}>
	<fieldset>
		<legend>Volume details</legend>
		<label>
			Name
			<input {...volumeCreate.fields.name} required autocomplete="off" />
		</label>
		<label>
			Quota (MiB, optional)
			<input placeholder="e.g. 1024" {...volumeCreate.fields.quotaMib} />
		</label>
		<div>
			<p>Optional labels (name/value pairs). Use <strong>Advanced</strong> to paste JSON.</p>
			<StructuredJsonField spec={volumeLabelsSpec} bind:json={labelsJson} name="labelsJson" />
		</div>
		<button type="submit" disabled={volumeCreate.pending > 0}>Create volume</button>
	</fieldset>
</form>
