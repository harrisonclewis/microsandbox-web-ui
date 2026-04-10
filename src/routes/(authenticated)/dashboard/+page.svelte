<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getDashboard } from './data.remote';

	const dashboard = getDashboard();
	const runColumns = [
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
	];
	const sandboxColumns = [
		{
			key: 'name',
			label: 'Sandbox',
			sortable: true,
			type: 'link',
			href: (row: any) => `/sandboxes/${row.id}`
		},
		{ key: 'status', label: 'Status', sortable: true, type: 'status' },
		{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Dashboard | Microsandbox Web UI</title>
</svelte:head>

<h1>Dashboard</h1>

{#if dashboard.error}
	<p>Unable to load dashboard data.</p>
{:else if dashboard.loading}
	<p>Loading dashboard...</p>
{:else if !dashboard.current}
	<p>No dashboard payload returned.</p>
{:else}
	<section>
		<h2>Totals</h2>
		<ul>
			<li>Sandboxes: {dashboard.current.counts.sandboxes}</li>
			<li>Runs: {dashboard.current.counts.runs}</li>
			<li>Images: {dashboard.current.counts.images}</li>
		</ul>
	</section>

	<section>
		<h2>Recent Sandbox Activity</h2>
		{#if dashboard.current.recentRuns.data.length === 0}
			<p>No runs recorded.</p>
		{:else}
			<DataTable
				namespace="runs"
				data={dashboard.current.recentRuns.data}
				columns={runColumns}
				currentSortBy={dashboard.current.recentRuns.sortBy}
				currentSortDir={dashboard.current.recentRuns.sortDir}
				defaultSortBy="startedAt"
				defaultSortDir="desc"
				currentPage={dashboard.current.recentRuns.page}
				totalPages={dashboard.current.recentRuns.totalPages}
			/>
		{/if}
	</section>

	<section>
		<h2>Recent Sandboxes</h2>
		{#if dashboard.current.recentSandboxes.data.length === 0}
			<p>No sandboxes found.</p>
		{:else}
			<DataTable
				namespace="sandboxes"
				data={dashboard.current.recentSandboxes.data}
				columns={sandboxColumns}
				currentSortBy={dashboard.current.recentSandboxes.sortBy}
				currentSortDir={dashboard.current.recentSandboxes.sortDir}
				defaultSortBy="updatedAt"
				defaultSortDir="desc"
				currentPage={dashboard.current.recentSandboxes.page}
				totalPages={dashboard.current.recentSandboxes.totalPages}
			/>
		{/if}
	</section>
{/if}
