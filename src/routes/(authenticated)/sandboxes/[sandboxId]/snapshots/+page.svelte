<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxSnapshots } from './data.remote';

	const snapshots = getSandboxSnapshots();
	const snapshotColumns = [
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/snapshots/${row.id}`
		},
		{ key: 'description', label: 'Description', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Sandbox Snapshots | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox Snapshots</h1>

{#if snapshots.error}
	<p>Unable to load snapshots.</p>
{:else if snapshots.loading}
	<p>Loading snapshots...</p>
{:else if !snapshots.current}
	<p>No snapshot payload returned.</p>
{:else if !snapshots.current.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<p>Sandbox: <a href={`/sandboxes/${snapshots.current.sandbox.id}`}>{snapshots.current.sandbox.name}</a></p>
	<p>Status: {snapshots.current.sandbox.status}</p>

	{#if snapshots.current.snapshots.data.length === 0}
		<p>No snapshots found.</p>
	{:else}
		<DataTable
			namespace="snapshots"
			data={snapshots.current.snapshots.data}
			columns={snapshotColumns}
			currentSortBy={snapshots.current.snapshots.sortBy}
			currentSortDir={snapshots.current.snapshots.sortDir}
			defaultSortBy="createdAt"
			defaultSortDir="desc"
			currentPage={snapshots.current.snapshots.page}
			totalPages={snapshots.current.snapshots.totalPages}
		/>
	{/if}
{/if}
