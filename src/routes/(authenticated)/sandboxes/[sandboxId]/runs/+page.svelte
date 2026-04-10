<script lang="ts">
	import { getSandboxRuns } from './data.remote';

	const runs = getSandboxRuns();
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

	{#if runs.current.runs.length === 0}
		<p>No runs found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Run</th>
					<th>PID</th>
					<th>Status</th>
					<th>Exit Code</th>
					<th>Signal</th>
					<th>Reason</th>
					<th>Started</th>
					<th>Ended</th>
				</tr>
			</thead>
			<tbody>
				{#each runs.current.runs as run}
					<tr>
						<td><a href={`/sandboxes/${runs.current.sandbox.id}/runs/${run.id}`}>Run #{run.id}</a></td>
						<td>{run.pid ?? 'n/a'}</td>
						<td>{run.status}</td>
						<td>{run.exitCode ?? 'n/a'}</td>
						<td>{run.exitSignal ?? 'n/a'}</td>
						<td>{run.terminationReason ?? 'n/a'}</td>
						<td>{run.startedAt ?? 'n/a'}</td>
						<td>{run.terminatedAt ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
