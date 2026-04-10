<script lang="ts">
	import { getLayerDetail } from './data.remote';

	const detail = getLayerDetail();
</script>

<svelte:head>
	<title>Layer Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Layer Detail</h1>

{#if detail.error}
	<p>Unable to load layer detail.</p>
{:else if detail.loading}
	<p>Loading layer detail...</p>
{:else if !detail.current}
	<p>No layer payload returned.</p>
{:else if !detail.current.layer}
	<p>Layer not found.</p>
{:else}
	<dl>
		<dt>Layer ID</dt>
		<dd>{detail.current.layer.id}</dd>
		<dt>Digest</dt>
		<dd>{detail.current.layer.digest}</dd>
		<dt>Diff ID</dt>
		<dd>{detail.current.layer.diffId}</dd>
		<dt>Media Type</dt>
		<dd>{detail.current.layer.mediaType ?? 'n/a'}</dd>
		<dt>Size Bytes</dt>
		<dd>{detail.current.layer.sizeBytes ?? 0}</dd>
		<dt>Created</dt>
		<dd>{detail.current.layer.createdAt ?? 'n/a'}</dd>
	</dl>

	<h2>Where Used</h2>
	{#if detail.current.usage.length === 0}
		<p>This layer is not attached to any manifest.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Image</th>
					<th>Manifest</th>
					<th>Position</th>
				</tr>
			</thead>
			<tbody>
				{#each detail.current.usage as use}
					<tr>
						<td><a href={`/images/${use.imageId}`}>{use.imageReference}</a></td>
						<td><a href={`/images/${use.imageId}/manifests/${use.manifestId}`}>{use.manifestDigest}</a></td>
						<td>{use.position}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
