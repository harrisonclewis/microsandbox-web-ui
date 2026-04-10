<script lang="ts">
	import { getImageDetail } from './data.remote';

	const detail = getImageDetail();
</script>

<svelte:head>
	<title>Image Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Image Detail</h1>

{#if detail.error}
	<p>Unable to load image detail.</p>
{:else if detail.loading}
	<p>Loading image detail...</p>
{:else if !detail.current}
	<p>No image payload returned.</p>
{:else if !detail.current.image}
	<p>Image not found.</p>
{:else}
	<section>
		<h2>{detail.current.image.reference}</h2>
		<dl>
			<dt>ID</dt>
			<dd>{detail.current.image.id}</dd>
			<dt>Size Bytes</dt>
			<dd>{detail.current.image.sizeBytes ?? 0}</dd>
			<dt>Last Used</dt>
			<dd>{detail.current.image.lastUsedAt ?? 'n/a'}</dd>
			<dt>Created</dt>
			<dd>{detail.current.image.createdAt ?? 'n/a'}</dd>
		</dl>
		<p>
			<a href={`/images/${detail.current.image.id}/manifests`}>Manifests</a>
		</p>
	</section>

	<section>
		<h2>Indexes</h2>
		{#if detail.current.indexes.length === 0}
			<p>No indexes found.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Index</th>
						<th>Media Type</th>
						<th>Schema</th>
						<th>Platform</th>
						<th>Created</th>
					</tr>
				</thead>
				<tbody>
					{#each detail.current.indexes as index}
						<tr>
							<td><a href={`/images/${detail.current.image.id}/indexes/${index.id}`}>Index #{index.id}</a></td>
							<td>{index.mediaType ?? 'n/a'}</td>
							<td>{index.schemaVersion ?? 'n/a'}</td>
							<td>{index.platformOs ?? 'n/a'} / {index.platformArch ?? 'n/a'} / {index.platformVariant ?? 'n/a'}</td>
							<td>{index.createdAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section>
		<h2>Recent Manifests</h2>
		{#if detail.current.manifests.length === 0}
			<p>No manifests found.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Manifest</th>
						<th>Digest</th>
						<th>Media Type</th>
						<th>Schema</th>
						<th>Created</th>
					</tr>
				</thead>
				<tbody>
					{#each detail.current.manifests as manifest}
						<tr>
							<td><a href={`/images/${detail.current.image.id}/manifests/${manifest.id}`}>Manifest #{manifest.id}</a></td>
							<td>{manifest.digest}</td>
							<td>{manifest.mediaType ?? 'n/a'}</td>
							<td>{manifest.schemaVersion ?? 'n/a'}</td>
							<td>{manifest.createdAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
{/if}
