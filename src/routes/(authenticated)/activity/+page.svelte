<script lang="ts">
	import { getActivity } from './data.remote';

	const activity = getActivity();
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
{:else if activity.current.length === 0}
	<p>No failure or termination activity found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Run</th>
				<th>Sandbox</th>
				<th>Status</th>
				<th>Exit Code</th>
				<th>Signal</th>
				<th>Reason</th>
				<th>Detail</th>
				<th>Started</th>
				<th>Ended</th>
			</tr>
		</thead>
		<tbody>
			{#each activity.current as row}
				<tr>
					<td><a href={`/sandboxes/${row.sandboxId}/runs/${row.id}`}>Run #{row.id}</a></td>
					<td><a href={`/sandboxes/${row.sandboxId}`}>{row.sandboxName}</a></td>
					<td>{row.status}</td>
					<td>{row.exitCode ?? 'n/a'}</td>
					<td>{row.exitSignal ?? 'n/a'}</td>
					<td>{row.terminationReason ?? 'n/a'}</td>
					<td>{row.terminationDetail ?? 'n/a'}</td>
					<td>{row.startedAt ?? 'n/a'}</td>
					<td>{row.terminatedAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
