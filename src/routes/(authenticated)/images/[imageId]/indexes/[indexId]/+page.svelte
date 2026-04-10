<script lang="ts">
	import { getIndexDetail } from './data.remote';

	const detail = getIndexDetail();
</script>

<svelte:head>
	<title>Image Index Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Image Index Detail</h1>

{#if detail.error}
	<p>Unable to load index detail.</p>
{:else if detail.loading}
	<p>Loading index detail...</p>
{:else if !detail.current}
	<p>No index payload returned.</p>
{:else if !detail.current.index}
	<p>Index not found.</p>
{:else}
	<dl>
		<dt>Index ID</dt>
		<dd>{detail.current.index.id}</dd>
		<dt>Schema Version</dt>
		<dd>{detail.current.index.schemaVersion ?? 'n/a'}</dd>
		<dt>Media Type</dt>
		<dd>{detail.current.index.mediaType ?? 'n/a'}</dd>
		<dt>Platform</dt>
		<dd>
			{detail.current.index.platformOs ?? 'n/a'} / {detail.current.index.platformArch ?? 'n/a'} /
			{detail.current.index.platformVariant ?? 'n/a'}
		</dd>
		<dt>Annotations</dt>
		<dd>{detail.current.index.annotations ?? 'n/a'}</dd>
		<dt>Created</dt>
		<dd>{detail.current.index.createdAt ?? 'n/a'}</dd>
	</dl>

	<h2>Manifests in Index</h2>
	{#if detail.current.manifests.length === 0}
		<p>No manifests found for this index.</p>
	{:else}
		<ul>
			{#each detail.current.manifests as manifest}
				<li>
					<a href={`/images/${detail.current.index.imageId}/manifests/${manifest.id}`}>
						Manifest #{manifest.id}
					</a>
					- {manifest.digest}
				</li>
			{/each}
		</ul>
	{/if}
{/if}
