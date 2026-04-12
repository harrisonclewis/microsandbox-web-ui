<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import {
		getDashboardRecentRuns,
		getDashboardRecentSandboxes,
		getDashboardStats
	} from './data.remote';

	const stats = getDashboardStats();
	const recentRuns = getDashboardRecentRuns();
	const recentSandboxes = getDashboardRecentSandboxes();
</script>

<svelte:head>
	<title>Dashboard | Microsandbox Web UI</title>
</svelte:head>

<h1>Dashboard</h1>

<section>
	<h2>Totals</h2>
	{#if stats.error}
		<p>Unable to load totals.</p>
	{:else if stats.loading}
		<p>Loading totals...</p>
	{:else if stats.current}
		<ul>
			<li>Sandboxes: {stats.current.sandboxes}</li>
			<li>Runs: {stats.current.runs}</li>
			<li>Images: {stats.current.images}</li>
		</ul>
	{:else}
		<p>No totals returned.</p>
	{/if}
</section>

<section>
	<h2>Recent Sandbox Activity</h2>
	<DataTable
		namespace="runs"
		remotePagination={recentRuns}
		remoteLabels={{
			error: 'Unable to load recent runs.',
			loading: 'Loading recent runs...',
			noPayload: 'No runs payload returned.',
			empty: 'No runs recorded.'
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
				key: 'sandboxId',
				label: 'Sandbox',
				sortable: true,
				type: 'link',
				text: (row: any) => `Sandbox #${row.sandboxId}`,
				href: (row: any) => `/sandboxes/${row.sandboxId}`
			},
			{ key: 'status', label: 'Status', sortable: true, type: 'status' },
			{ key: 'exitCode', label: 'Exit', sortable: true, empty: 'n/a' },
			{ key: 'terminationReason', label: 'Termination', sortable: true, empty: 'n/a' },
			{ key: 'startedAt', label: 'Started', sortable: true, type: 'date' },
			{ key: 'terminatedAt', label: 'Ended', sortable: true, type: 'date' }
		]}
	/>
</section>

<section>
	<h2>Recent Sandboxes</h2>
	<DataTable
		namespace="sandboxes"
		remotePagination={recentSandboxes}
		remoteLabels={{
			error: 'Unable to load recent sandboxes.',
			loading: 'Loading recent sandboxes...',
			noPayload: 'No sandboxes payload returned.',
			empty: 'No sandboxes found.'
		}}
		columns={[
			{
				key: 'name',
				label: 'Sandbox',
				sortable: true,
				type: 'link',
				href: (row: any) => `/sandboxes/${row.id}`
			},
			{ key: 'status', label: 'Status', sortable: true, type: 'status' },
			{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
		]}
	/>
</section>
