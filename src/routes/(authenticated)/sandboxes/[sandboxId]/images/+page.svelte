<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxImages } from './data.remote';

	const images = getSandboxImages();
	const imageColumns = [
		{
			key: 'imageReference',
			label: 'Image',
			sortable: true,
			type: 'link',
			href: (row: any) => `/images/${row.imageId}`
		},
		{ key: 'manifestDigest', label: 'Manifest Digest', sortable: true },
		{ key: 'createdAt', label: 'Linked At', sortable: true, type: 'date' }
	];
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

	{#if images.current.images.data.length === 0}
		<p>No image associations found.</p>
	{:else}
		<DataTable
			namespace="images"
			data={images.current.images.data}
			columns={imageColumns}
			currentSortBy={images.current.images.sortBy}
			currentSortDir={images.current.images.sortDir}
			defaultSortBy="createdAt"
			defaultSortDir="desc"
			currentPage={images.current.images.page}
			totalPages={images.current.images.totalPages}
		/>
	{/if}
{/if}
