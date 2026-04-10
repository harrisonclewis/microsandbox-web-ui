<script lang="ts">
	import { getDashboard } from './data.remote';

	const dashboard = getDashboard();
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
		{#if dashboard.current.recentRuns.length === 0}
			<p>No runs recorded.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Run</th>
						<th>Sandbox</th>
						<th>Status</th>
						<th>Exit</th>
						<th>Termination</th>
						<th>Started</th>
						<th>Ended</th>
					</tr>
				</thead>
				<tbody>
					{#each dashboard.current.recentRuns as run}
						<tr>
							<td><a href={`/sandboxes/${run.sandboxId}/runs/${run.id}`}>Run #{run.id}</a></td>
							<td><a href={`/sandboxes/${run.sandboxId}`}>Sandbox #{run.sandboxId}</a></td>
							<td>{run.status}</td>
							<td>{run.exitCode ?? 'n/a'}</td>
							<td>{run.terminationReason ?? 'n/a'}</td>
							<td>{run.startedAt ?? 'n/a'}</td>
							<td>{run.terminatedAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section>
		<h2>Recent Sandboxes</h2>
		{#if dashboard.current.recentSandboxes.length === 0}
			<p>No sandboxes found.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Sandbox</th>
						<th>Status</th>
						<th>Updated</th>
					</tr>
				</thead>
				<tbody>
					{#each dashboard.current.recentSandboxes as sandbox}
						<tr>
							<td><a href={`/sandboxes/${sandbox.id}`}>{sandbox.name}</a></td>
							<td>{sandbox.status}</td>
							<td>{sandbox.updatedAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
{/if}
