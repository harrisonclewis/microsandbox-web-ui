<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxes } from './data.remote';

	const sandboxes = getSandboxes();
</script>

<svelte:head>
	<title>Sandboxes | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandboxes</h1>
<p><a href="/sandboxes/new">View create schema preview</a></p>

<DataTable
	namespace="sandboxes"
	remotePagination={sandboxes}
	remoteLabels={{
		error: 'Unable to load sandboxes.',
		loading: 'Loading sandboxes...',
		noPayload: 'No sandbox payload returned.',
		empty: 'No sandboxes found.'
	}}
	columns={[
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
	]}
/>
