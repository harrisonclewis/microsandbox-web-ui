<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxImages } from './data.remote';

	const images = getSandboxImages();

	const sandboxImagesRemote = {
		get current() {
			return images.current?.images;
		},
		refresh: () => images.refresh()
	};
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

	<DataTable
		namespace="images"
		remotePagination={sandboxImagesRemote}
		remoteLabels={{
			empty: 'No image associations found.'
		}}
		columns={[
			{
				key: 'imageReference',
				label: 'Image',
				sortable: true,
				type: 'link',
				href: (row: any) => `/images/${row.imageId}`
			},
			{ key: 'manifestDigest', label: 'Manifest Digest', sortable: true },
			{ key: 'createdAt', label: 'Linked At', sortable: true, type: 'date' }
		]}
	/>
{/if}
