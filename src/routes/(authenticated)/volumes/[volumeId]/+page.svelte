<script lang="ts">
	import { getVolumeDetail } from './data.remote';

	const detail = getVolumeDetail();
</script>

<svelte:head>
	<title>Volume Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Volume Detail</h1>

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
{/if}
