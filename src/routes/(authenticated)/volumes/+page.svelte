<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getVolumes } from './data.remote';

	const volumes = getVolumes();
	const volumeColumns = [
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/volumes/${row.id}`
		},
		{ key: 'quotaMib', label: 'Quota MiB', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'labels', label: 'Labels', empty: 'n/a' },
		{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Volumes | Microsandbox Web UI</title>
</svelte:head>

<h1>Volumes</h1>
<p><a href="/volumes/new">View create schema preview</a></p>

{#if volumes.error}
	<p>Unable to load volumes.</p>
{:else if volumes.loading}
	<p>Loading volumes...</p>
{:else if !volumes.current}
	<p>No volume payload returned.</p>
{:else if volumes.current.data.length === 0}
	<p>No volumes found.</p>
{:else}
	<DataTable
		namespace="volumes"
		data={volumes.current.data}
		columns={volumeColumns}
		currentSortBy={volumes.current.sortBy}
		currentSortDir={volumes.current.sortDir}
		defaultSortBy="name"
		defaultSortDir="asc"
		currentPage={volumes.current.page}
		totalPages={volumes.current.totalPages}
	/>
{/if}
