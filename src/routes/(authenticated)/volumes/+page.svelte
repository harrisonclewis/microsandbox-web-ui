<script lang="ts">
	import { getVolumes } from './data.remote';

	const volumes = getVolumes();
</script>

<svelte:head>
	<title>Volumes | Microsandbox Web UI</title>
</svelte:head>

<h1>Volumes</h1>
<p><a href="/volumes/new">View create schema preview</a></p>

{#if volumes.error}
	<p>Unable to load volumes.</p>
{:else if volumes.loading}
	<p>Loading volumes...</p>
{:else if !volumes.current}
	<p>No volume payload returned.</p>
{:else if volumes.current.length === 0}
	<p>No volumes found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Quota MiB</th>
				<th>Size Bytes</th>
				<th>Labels</th>
				<th>Updated</th>
			</tr>
		</thead>
		<tbody>
			{#each volumes.current as volume}
				<tr>
					<td><a href={`/volumes/${volume.id}`}>{volume.name}</a></td>
					<td>{volume.quotaMib ?? 'n/a'}</td>
					<td>{volume.sizeBytes ?? 0}</td>
					<td>{volume.labels ?? 'n/a'}</td>
					<td>{volume.updatedAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
