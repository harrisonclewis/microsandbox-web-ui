<script lang="ts">
	import { getManifestLayers } from './data.remote';

	const layers = getManifestLayers();
</script>

<svelte:head>
	<title>Manifest Layers | Microsandbox Web UI</title>
</svelte:head>

<h1>Manifest Layers</h1>

{#if layers.error}
	<p>Unable to load layers.</p>
{:else if layers.loading}
	<p>Loading layers...</p>
{:else if !layers.current}
	<p>No layer payload returned.</p>
{:else if !layers.current.manifest}
	<p>Manifest not found.</p>
{:else}
	<p>Manifest: {layers.current.manifest.digest}</p>

	{#if layers.current.layers.length === 0}
		<p>No layers attached.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Position</th>
					<th>Layer</th>
					<th>Digest</th>
					<th>Diff ID</th>
					<th>Media Type</th>
					<th>Size Bytes</th>
					<th>Created</th>
				</tr>
			</thead>
			<tbody>
				{#each layers.current.layers as row}
					<tr>
						<td>{row.position}</td>
						<td><a href={`/layers/${row.layerId}`}>Layer #{row.layerId}</a></td>
						<td>{row.digest}</td>
						<td>{row.diffId}</td>
						<td>{row.mediaType ?? 'n/a'}</td>
						<td>{row.sizeBytes ?? 0}</td>
						<td>{row.createdAt ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
