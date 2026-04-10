<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxes } from './data.remote';

	const sandboxes = getSandboxes();
	const sandboxColumns = [
		{ key: 'id', label: 'ID', sortable: true },
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/sandboxes/${row.id}`
		},
		{ key: 'status', label: 'Status', sortable: true, type: 'status' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' },
		{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Sandboxes | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandboxes</h1>
<p><a href="/sandboxes/new">View create schema preview</a></p>

{#if sandboxes.error}
	<p>Unable to load sandboxes.</p>
{:else if sandboxes.loading}
	<p>Loading sandboxes...</p>
{:else if !sandboxes.current}
	<p>No sandbox payload returned.</p>
{:else if sandboxes.current.data.length === 0}
	<p>No sandboxes found.</p>
{:else}
	<DataTable
		namespace="sandboxes"
		data={sandboxes.current.data}
		columns={sandboxColumns}
		currentSortBy={sandboxes.current.sortBy}
		currentSortDir={sandboxes.current.sortDir}
		defaultSortBy="name"
		defaultSortDir="asc"
		currentPage={sandboxes.current.page}
		totalPages={sandboxes.current.totalPages}
	/>
{/if}
