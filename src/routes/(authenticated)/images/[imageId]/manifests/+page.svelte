<script lang="ts">
	import { getImageManifests } from './data.remote';

	const manifests = getImageManifests();
</script>

<svelte:head>
	<title>Image Manifests | Microsandbox Web UI</title>
</svelte:head>

<h1>Image Manifests</h1>

{#if manifests.error}
	<p>Unable to load manifests.</p>
{:else if manifests.loading}
	<p>Loading manifests...</p>
{:else if !manifests.current}
	<p>No manifest payload returned.</p>
{:else if !manifests.current.image}
	<p>Image not found.</p>
{:else}
	<p>
		Image:
		<a href={`/images/${manifests.current.image.id}`}>{manifests.current.image.reference}</a>
	</p>

	{#if manifests.current.manifests.length === 0}
		<p>No manifests found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Manifest</th>
					<th>Digest</th>
					<th>Media Type</th>
					<th>Schema</th>
					<th>Index ID</th>
					<th>Created</th>
				</tr>
			</thead>
			<tbody>
				{#each manifests.current.manifests as manifest}
					<tr>
						<td><a href={`/images/${manifests.current.image.id}/manifests/${manifest.id}`}>Manifest #{manifest.id}</a></td>
						<td>{manifest.digest}</td>
						<td>{manifest.mediaType ?? 'n/a'}</td>
						<td>{manifest.schemaVersion ?? 'n/a'}</td>
						<td>{manifest.indexId ?? 'n/a'}</td>
						<td>{manifest.createdAt ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
