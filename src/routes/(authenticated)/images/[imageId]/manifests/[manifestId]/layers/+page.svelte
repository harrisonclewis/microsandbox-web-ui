<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getManifestLayers } from './data.remote';

	const layers = getManifestLayers();
	const layerColumns = [
		{ key: 'position', label: 'Position', sortable: true },
		{
			key: 'layerId',
			label: 'Layer',
			sortable: true,
			type: 'link',
			text: (row: any) => `Layer #${row.layerId}`,
			href: (row: any) => `/layers/${row.layerId}`
		},
		{ key: 'digest', label: 'Digest', sortable: true },
		{ key: 'diffId', label: 'Diff ID', sortable: true, empty: 'n/a' },
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Manifest Layers | Microsandbox Web UI</title>
</svelte:head>

<h1>Manifest Layers</h1>

{#if layers.error}
	<p>Unable to load layers.</p>
{:else if layers.loading}
	<p>Loading layers...</p>
{:else if !layers.current}
	<p>No layer payload returned.</p>
{:else if !layers.current.manifest}
	<p>Manifest not found.</p>
{:else}
	<p>Manifest: {layers.current.manifest.digest}</p>

	{#if layers.current.layers.data.length === 0}
		<p>No layers attached.</p>
	{:else}
		<DataTable
			namespace="layers"
			data={layers.current.layers.data}
			columns={layerColumns}
			currentSortBy={layers.current.layers.sortBy}
			currentSortDir={layers.current.layers.sortDir}
			defaultSortBy="position"
			defaultSortDir="asc"
			currentPage={layers.current.layers.page}
			totalPages={layers.current.layers.totalPages}
		/>
	{/if}
{/if}
