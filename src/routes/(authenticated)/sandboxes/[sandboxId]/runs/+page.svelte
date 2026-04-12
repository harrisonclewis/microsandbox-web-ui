<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxRuns } from './data.remote';

	const runs = getSandboxRuns();

	const runsRemote = {
		get current() {
			return runs.current?.runs;
		},
		refresh: () => runs.refresh()
	};
</script>

<svelte:head>
	<title>Sandbox Runs | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox Runs</h1>

{#if runs.error}
	<p>Unable to load runs.</p>
{:else if runs.loading}
	<p>Loading runs...</p>
{:else if !runs.current}
	<p>No run payload returned.</p>
{:else if !runs.current.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<p>Sandbox: <a href={`/sandboxes/${runs.current.sandbox.id}`}>{runs.current.sandbox.name}</a></p>
	<p>Status: {runs.current.sandbox.status}</p>

	<DataTable
		namespace="runs"
		remotePagination={runsRemote}
		remoteLabels={{
			empty: 'No runs found.'
		}}
		columns={[
			{
				key: 'id',
				label: 'Run',
				sortable: true,
				type: 'link',
				text: (row: any) => `Run #${row.id}`,
				href: (row: any) => `/sandboxes/${runs.current?.sandbox.id}/runs/${row.id}`
			},
			{ key: 'pid', label: 'PID', sortable: true, empty: 'n/a' },
			{ key: 'status', label: 'Status', sortable: true, type: 'status' },
			{ key: 'exitCode', label: 'Exit Code', sortable: true, empty: 'n/a' },
			{ key: 'exitSignal', label: 'Signal', sortable: true, empty: 'n/a' },
			{ key: 'terminationReason', label: 'Reason', sortable: true, empty: 'n/a' },
			{ key: 'startedAt', label: 'Started', sortable: true, type: 'date' },
			{ key: 'terminatedAt', label: 'Ended', sortable: true, type: 'date' }
		]}
	/>
{/if}
