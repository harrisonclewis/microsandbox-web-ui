<script lang="ts">
    import { convertBytes } from '$lib';
	import DataTable from '$lib/components/table/DataTable.svelte';
	import {
		getDashboardRecentRuns,
		getDashboardRecentSandboxes,
		getDashboardStats,
		getLiveSdkMetrics
	} from './data.remote';

	const stats = getDashboardStats();
	const recentRuns = getDashboardRecentRuns();
	const recentSandboxes = getDashboardRecentSandboxes();
	const liveSdk = getLiveSdkMetrics();
</script>

<svelte:head>
	<title>Dashboard | Microsandbox Web UI</title>
</svelte:head>

<h1>Dashboard</h1>

<section>
	<h2>Live SDK metrics</h2>
	{#if liveSdk.error}
		<p>Unable to load SDK metrics.</p>
	{:else if liveSdk.loading}
		<p>Loading SDK metrics…</p>
	{:else if liveSdk.current}
		{#if !liveSdk.current.capabilities.supportedHost}
			<p>SDK not supported on this server host.</p>
		{:else if !liveSdk.current.capabilities.installed}
			<p>SDK runtime not installed. <a href="/settings/sdk">SDK settings</a></p>
		{:else if liveSdk.current.metrics && !liveSdk.current.metrics.ok}
			<p role="alert">{liveSdk.current.metrics.message}</p>
		{:else if liveSdk.current.metrics?.ok}
			<ul>
				{#each Object.entries(liveSdk.current.metrics.data) as [name, m] (name)}
					<li>
						<strong>{name}</strong>: CPU {m.cpuPercent?.toFixed?.(1) ?? m.cpuPercent}% · mem
						{m.memoryBytes} / {m.memoryLimitBytes} B
					</li>
				{/each}
			</ul>
		{:else}
			<p>No metrics.</p>
		{/if}
	{/if}
</section>

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
				key: 'id', 
				label: 'ID', 
				sortable: true 
			},
			{
				key: 'name',
				label: 'Sandbox',
				sortable: true,
				type: 'link',
				href: (row: any) => `/sandboxes/${row.id}`
			},
			{
				key: 'cpus',
				label: 'CPUs',
				value: (row: any) => {
					const cpus = row.config?.data?.cpus;
					return cpus != null ? cpus : 'n/a';
				}
			},
			{
				key: 'imageOci',
				label: 'Image (OCI)',
				value: (row: any) => {
					const img = row.config?.data?.image;
					const ref = img?.Oci ?? img?.Path;
					return ref != null && ref !== '' ? ref : 'n/a';
				}
			},
			{
				key: 'memoryMib',
				label: 'Memory',
				value: (row: any) => {
					const mib = row.config?.data?.memory_mib;
					return mib != null ? convertBytes(mib * 1024 * 1024) : 'n/a';
				}
			},
			{ key: 'status', label: 'Status', sortable: true, type: 'status' },
			{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
		]}
	/>
</section>
