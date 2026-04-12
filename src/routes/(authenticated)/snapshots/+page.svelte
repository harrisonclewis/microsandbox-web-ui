<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSnapshots } from './data.remote';

	const snapshots = getSnapshots();
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

<DataTable
	namespace="snapshots"
	remotePagination={snapshots}
	data={snapshotData}
	remoteLabels={{
		error: 'Unable to load snapshots.',
		loading: 'Loading snapshots...',
		noPayload: 'No snapshot payload returned.',
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
	]}
/>
