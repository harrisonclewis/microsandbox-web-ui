<script lang="ts">
	import { getImages } from './data.remote';

	const images = getImages();
</script>

<svelte:head>
	<title>Images | Microsandbox Web UI</title>
</svelte:head>

<h1>Images</h1>
<p><a href="/images/new">View import schema preview</a></p>

{#if images.error}
	<p>Unable to load images.</p>
{:else if images.loading}
	<p>Loading images...</p>
{:else if !images.current}
	<p>No image payload returned.</p>
{:else if images.current.length === 0}
	<p>No images found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Reference</th>
				<th>Size Bytes</th>
				<th>Last Used</th>
				<th>Created</th>
			</tr>
		</thead>
		<tbody>
			{#each images.current as image}
				<tr>
					<td><a href={`/images/${image.id}`}>{image.reference}</a></td>
					<td>{image.sizeBytes ?? 0}</td>
					<td>{image.lastUsedAt ?? 'n/a'}</td>
					<td>{image.createdAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
