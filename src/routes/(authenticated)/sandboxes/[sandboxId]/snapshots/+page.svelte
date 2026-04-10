<script lang="ts">
	import { getSandboxSnapshots } from './data.remote';

	const snapshots = getSandboxSnapshots();
</script>

<svelte:head>
	<title>Sandbox Snapshots | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox Snapshots</h1>

{#if snapshots.error}
	<p>Unable to load snapshots.</p>
{:else if snapshots.loading}
	<p>Loading snapshots...</p>
{:else if !snapshots.current}
	<p>No snapshot payload returned.</p>
{:else if !snapshots.current.sandbox}
	<p>Sandbox not found.</p>
{:else}
	<p>Sandbox: <a href={`/sandboxes/${snapshots.current.sandbox.id}`}>{snapshots.current.sandbox.name}</a></p>
	<p>Status: {snapshots.current.sandbox.status}</p>

	{#if snapshots.current.snapshots.length === 0}
		<p>No snapshots found.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Size Bytes</th>
					<th>Created</th>
				</tr>
			</thead>
			<tbody>
				{#each snapshots.current.snapshots as snapshot}
					<tr>
						<td><a href={`/snapshots/${snapshot.id}`}>{snapshot.name}</a></td>
						<td>{snapshot.description ?? 'n/a'}</td>
						<td>{snapshot.sizeBytes ?? 0}</td>
						<td>{snapshot.createdAt ?? 'n/a'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}
