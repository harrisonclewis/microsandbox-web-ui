<script lang="ts">
	import { getSandboxMetrics } from './data.remote';

	const metrics = getSandboxMetrics();
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

	{#if metrics.current.metrics.length === 0}
		<p>No metric samples found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Sampled At</th>
					<th>CPU %</th>
					<th>Memory Bytes</th>
					<th>Disk Read</th>
					<th>Disk Write</th>
					<th>Net RX</th>
					<th>Net TX</th>
				</tr>
			</thead>
			<tbody>
				{#each metrics.current.metrics as row}
					<tr>
						<td>{row.sampledAt ?? 'n/a'}</td>
						<td>{row.cpuPercent ?? 'n/a'}</td>
						<td>{row.memoryBytes ?? 'n/a'}</td>
						<td>{row.diskReadBytes ?? 'n/a'}</td>
						<td>{row.diskWriteBytes ?? 'n/a'}</td>
						<td>{row.netRxBytes ?? 'n/a'}</td>
						<td>{row.netTxBytes ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
