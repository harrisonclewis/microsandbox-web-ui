<script lang="ts">
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import { volumeRemove } from '../actions.remote';
	import { getVolumeDetail } from './data.remote';

	const detail = getVolumeDetail();
</script>

<svelte:head>
	<title>Volume Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Volume Detail</h1>

<SdkUrlFeedback />

{#if detail.error}
	<p>Unable to load volume detail.</p>
{:else if detail.loading}
	<p>Loading volume detail...</p>
{:else if !detail.current}
	<p>Volume not found.</p>
{:else}
	<dl>
		<dt>Volume ID</dt>
		<dd>{detail.current.id}</dd>
		<dt>Name</dt>
		<dd>{detail.current.name}</dd>
		<dt>Quota MiB</dt>
		<dd>{detail.current.quotaMib ?? 'n/a'}</dd>
		<dt>Size Bytes</dt>
		<dd>{detail.current.sizeBytes ?? 0}</dd>
		<dt>Labels</dt>
		<dd>{detail.current.labels ?? 'n/a'}</dd>
		<dt>Created</dt>
		<dd>{detail.current.createdAt ?? 'n/a'}</dd>
		<dt>Updated</dt>
		<dd>{detail.current.updatedAt ?? 'n/a'}</dd>
	</dl>

	<section>
		<h2>SDK remove</h2>
		<p>Removes the named volume via <code>Volume.remove</code> (fails if still mounted).</p>
		{#if volumeRemove.fields.allIssues()?.length}
			<ul role="alert">
				{#each volumeRemove.fields.allIssues() ?? [] as issue}
					<li>{issue.message}</li>
				{/each}
			</ul>
		{/if}
		<form {...volumeRemove}>
			<input type="hidden" name="name" value={detail.current.name} />
			<input type="hidden" name="confirm" value="REMOVE_VOLUME" />
			<button type="submit" disabled={volumeRemove.pending > 0}>Remove volume</button>
		</form>
	</section>
{/if}
