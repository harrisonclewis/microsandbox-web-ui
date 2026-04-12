<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getActivity } from './data.remote';

	const activity = getActivity();
</script>

<svelte:head>
	<title>Activity | Microsandbox Web UI</title>
</svelte:head>

<h1>Activity</h1>
<p>Recent runs focused on failures and terminations.</p>

<DataTable
	namespace="activity"
	remotePagination={activity}
	remoteLabels={{
		error: 'Unable to load activity.',
		loading: 'Loading activity...',
		noPayload: 'No activity payload returned.',
		empty: 'No failure or termination activity found.'
	}}
	columns={[
		{
			key: 'id',
			label: 'Run',
			sortable: true,
			type: 'link',
			text: (row: any) => `Run #${row.id}`,
			href: (row: any) => `/sandboxes/${row.sandboxId}/runs/${row.id}`
		},
		{
			key: 'sandboxName',
			label: 'Sandbox',
			sortable: true,
			type: 'link',
			href: (row: any) => `/sandboxes/${row.sandboxId}`
		},
		{ key: 'status', label: 'Status', sortable: true, type: 'status' },
		{ key: 'exitCode', label: 'Exit Code', sortable: true, empty: 'n/a' },
		{ key: 'exitSignal', label: 'Signal', sortable: true, empty: 'n/a' },
		{ key: 'terminationReason', label: 'Reason', sortable: true, empty: 'n/a' },
		{ key: 'terminationDetail', label: 'Detail', sortable: true, empty: 'n/a' },
		{ key: 'startedAt', label: 'Started', sortable: true, type: 'date' },
		{ key: 'terminatedAt', label: 'Ended', sortable: true, type: 'date' }
	]}
/>
