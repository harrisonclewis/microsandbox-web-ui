<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxSnapshots } from './data.remote';

	const snapshots = getSandboxSnapshots();

	const sandboxSnapshotsRemote = {
		get current() {
			return snapshots.current?.snapshots;
		},
		refresh: () => snapshots.refresh()
	};
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

	<DataTable
		namespace="snapshots"
		remotePagination={sandboxSnapshotsRemote}
		remoteLabels={{
			empty: 'No snapshots found.'
		}}
		columns={[
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
		]}
	/>
{/if}
