<script lang="ts">
	import { getManifestDetail } from './data.remote';

	const detail = getManifestDetail();
</script>

<svelte:head>
	<title>Manifest Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Manifest Detail</h1>

{#if detail.error}
	<p>Unable to load manifest detail.</p>
{:else if detail.loading}
	<p>Loading manifest detail...</p>
{:else if !detail.current}
	<p>Manifest not found.</p>
{:else}
	<dl>
		<dt>Manifest ID</dt>
		<dd>{detail.current.id}</dd>
		<dt>Digest</dt>
		<dd>{detail.current.digest}</dd>
		<dt>Media Type</dt>
		<dd>{detail.current.mediaType ?? 'n/a'}</dd>
		<dt>Schema Version</dt>
		<dd>{detail.current.schemaVersion ?? 'n/a'}</dd>
		<dt>Index ID</dt>
		<dd>{detail.current.indexId ?? 'n/a'}</dd>
		<dt>Annotations</dt>
		<dd>{detail.current.annotations ?? 'n/a'}</dd>
		<dt>Created</dt>
		<dd>{detail.current.createdAt ?? 'n/a'}</dd>
	</dl>

	<p>
		<a href={`/images/${detail.current.imageId}/manifests/${detail.current.id}/config`}>Config</a>
		<a href={`/images/${detail.current.imageId}/manifests/${detail.current.id}/layers`}>Layers</a>
	</p>
{/if}
