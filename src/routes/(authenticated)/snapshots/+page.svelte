<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSnapshots } from './data.remote';

	const snapshots = getSnapshots();
	const snapshotColumns = [
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/snapshots/${row.id}`
		},
		{
			key: 'sandboxName',
			label: 'Sandbox',
			sortable: true,
			type: 'link',
			text: (row: any) => row.sandboxName ?? `Sandbox #${row.sandboxId}`,
			href: (row: any) => `/sandboxes/${row.sandboxId}`,
			empty: 'n/a'
		},
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
	const snapshotData = $derived(
		(snapshots.current?.data ?? []).map((snapshot) => ({
			...snapshot,
			sandboxName: snapshot.sandboxId ? snapshot.sandboxName : null
		}))
	);
</script>

<svelte:head>
	<title>Snapshots | Microsandbox Web UI</title>
</svelte:head>

<h1>Snapshots</h1>

{#if snapshots.error}
	<p>Unable to load snapshots.</p>
{:else if snapshots.loading}
	<p>Loading snapshots...</p>
{:else if !snapshots.current}
	<p>No snapshot payload returned.</p>
{:else if snapshots.current.data.length === 0}
	<p>No snapshots found.</p>
{:else}
	<DataTable
		namespace="snapshots"
		data={snapshotData}
		columns={snapshotColumns}
		currentSortBy={snapshots.current.sortBy}
		currentSortDir={snapshots.current.sortDir}
		defaultSortBy="createdAt"
		defaultSortDir="desc"
		currentPage={snapshots.current.page}
		totalPages={snapshots.current.totalPages}
	/>
{/if}
