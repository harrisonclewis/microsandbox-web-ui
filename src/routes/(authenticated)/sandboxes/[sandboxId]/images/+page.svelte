<script lang="ts">
	import { getSandboxImages } from './data.remote';

	const images = getSandboxImages();
</script>

<svelte:head>
	<title>Sandbox Images | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox Images</h1>

{#if images.error}
	<p>Unable to load sandbox images.</p>
{:else if images.loading}
	<p>Loading sandbox images...</p>
{:else if !images.current}
	<p>No image payload returned.</p>
{:else if !images.current.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<p>Sandbox: <a href={`/sandboxes/${images.current.sandbox.id}`}>{images.current.sandbox.name}</a></p>
	<p>Status: {images.current.sandbox.status}</p>

	{#if images.current.images.length === 0}
		<p>No image associations found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Image</th>
					<th>Manifest Digest</th>
					<th>Linked At</th>
				</tr>
			</thead>
			<tbody>
				{#each images.current.images as row}
					<tr>
						<td><a href={`/images/${row.imageId}`}>{row.imageReference}</a></td>
						<td>{row.manifestDigest}</td>
						<td>{row.createdAt ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
