<script lang="ts">
	import { getLayers } from './data.remote';

	const layers = getLayers();
</script>

<svelte:head>
	<title>Layers | Microsandbox Web UI</title>
</svelte:head>

<h1>Layers</h1>

{#if layers.error}
	<p>Unable to load layers.</p>
{:else if layers.loading}
	<p>Loading layers...</p>
{:else if !layers.current}
	<p>No layer payload returned.</p>
{:else if layers.current.length === 0}
	<p>No layers found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Layer</th>
				<th>Digest</th>
				<th>Diff ID</th>
				<th>Media Type</th>
				<th>Size Bytes</th>
				<th>Created</th>
			</tr>
		</thead>
		<tbody>
			{#each layers.current as layer}
				<tr>
					<td><a href={`/layers/${layer.id}`}>Layer #{layer.id}</a></td>
					<td>{layer.digest}</td>
					<td>{layer.diffId}</td>
					<td>{layer.mediaType ?? 'n/a'}</td>
					<td>{layer.sizeBytes ?? 0}</td>
					<td>{layer.createdAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
