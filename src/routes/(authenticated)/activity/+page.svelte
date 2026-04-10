<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getActivity } from './data.remote';

	const activity = getActivity();
	const activityColumns = [
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
	];
</script>

<svelte:head>
	<title>Activity | Microsandbox Web UI</title>
</svelte:head>

<h1>Activity</h1>
<p>Recent runs focused on failures and terminations.</p>

{#if activity.error}
	<p>Unable to load activity.</p>
{:else if activity.loading}
	<p>Loading activity...</p>
{:else if !activity.current}
	<p>No activity payload returned.</p>
{:else if activity.current.data.length === 0}
	<p>No failure or termination activity found.</p>
{:else}
	<DataTable
		namespace="activity"
		data={activity.current.data}
		columns={activityColumns}
		currentSortBy={activity.current.sortBy}
		currentSortDir={activity.current.sortDir}
		defaultSortBy="startedAt"
		defaultSortDir="desc"
		currentPage={activity.current.page}
		totalPages={activity.current.totalPages}
	/>
{/if}
