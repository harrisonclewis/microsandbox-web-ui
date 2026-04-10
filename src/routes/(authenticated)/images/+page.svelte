<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getImages } from './data.remote';

	const images = getImages();
	const imageColumns = [
		{
			key: 'reference',
			label: 'Reference',
			sortable: true,
			type: 'link',
			href: (row: any) => `/images/${row.id}`
		},
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'lastUsedAt', label: 'Last Used', sortable: true, type: 'date' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
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
{:else if images.current.data.length === 0}
	<p>No images found.</p>
{:else}
	<DataTable
		namespace="images"
		data={images.current.data}
		columns={imageColumns}
		currentSortBy={images.current.sortBy}
		currentSortDir={images.current.sortDir}
		defaultSortBy="reference"
		defaultSortDir="asc"
		currentPage={images.current.page}
		totalPages={images.current.totalPages}
	/>
{/if}
