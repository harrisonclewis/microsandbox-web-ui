<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getLayers } from './data.remote';

	const layers = getLayers();
	const layerColumns = [
		{
			key: 'id',
			label: 'Layer',
			sortable: true,
			type: 'link',
			text: (row: any) => `Layer #${row.id}`,
			href: (row: any) => `/layers/${row.id}`
		},
		{ key: 'digest', label: 'Digest', sortable: true },
		{ key: 'diffId', label: 'Diff ID', sortable: true },
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Layers | Microsandbox Web UI</title>
</svelte:head>

<h1>Layers</h1>

{#if layers.error}
	<p>Unable to load layers.</p>
{:else if layers.loading}
	<p>Loading layers...</p>
{:else if !layers.current}
	<p>No layer payload returned.</p>
{:else if layers.current.data.length === 0}
	<p>No layers found.</p>
{:else}
	<DataTable
		namespace="layers"
		data={layers.current.data}
		columns={layerColumns}
		currentSortBy={layers.current.sortBy}
		currentSortDir={layers.current.sortDir}
		defaultSortBy="id"
		defaultSortDir="asc"
		currentPage={layers.current.page}
		totalPages={layers.current.totalPages}
	/>
{/if}
