<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxMetrics } from './data.remote';

	const metrics = getSandboxMetrics();
	const metricColumns = [
		{ key: 'sampledAt', label: 'Sampled At', sortable: true, type: 'date' },
		{ key: 'cpuPercent', label: 'CPU %', sortable: true, empty: 'n/a' },
		{ key: 'memoryBytes', label: 'Memory Bytes', sortable: true, empty: 'n/a' },
		{ key: 'diskReadBytes', label: 'Disk Read', sortable: true, empty: 'n/a' },
		{ key: 'diskWriteBytes', label: 'Disk Write', sortable: true, empty: 'n/a' },
		{ key: 'netRxBytes', label: 'Net RX', sortable: true, empty: 'n/a' },
		{ key: 'netTxBytes', label: 'Net TX', sortable: true, empty: 'n/a' }
	];
</script>

<svelte:head>
	<title>Sandbox Metrics | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox Metrics</h1>

{#if metrics.error}
	<p>Unable to load metrics.</p>
{:else if metrics.loading}
	<p>Loading metrics...</p>
{:else if !metrics.current}
	<p>No metrics payload returned.</p>
{:else if !metrics.current.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<p>Sandbox: <a href={`/sandboxes/${metrics.current.sandbox.id}`}>{metrics.current.sandbox.name}</a></p>
	<p>Status: {metrics.current.sandbox.status}</p>

	{#if metrics.current.metrics.data.length === 0}
		<p>No metric samples found.</p>
	{:else}
		<DataTable
			namespace="metrics"
			data={metrics.current.metrics.data}
			columns={metricColumns}
			currentSortBy={metrics.current.metrics.sortBy}
			currentSortDir={metrics.current.metrics.sortDir}
			defaultSortBy="sampledAt"
			defaultSortDir="desc"
			currentPage={metrics.current.metrics.page}
			totalPages={metrics.current.metrics.totalPages}
		/>
	{/if}
{/if}
