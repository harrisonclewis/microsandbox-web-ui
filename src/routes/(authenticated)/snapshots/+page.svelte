<script lang="ts">
	import { getSnapshots } from './data.remote';

	const snapshots = getSnapshots();
</script>

<svelte:head>
	<title>Snapshots | Microsandbox Web UI</title>
</svelte:head>

<h1>Snapshots</h1>

{#if snapshots.error}
	<p>Unable to load snapshots.</p>
{:else if snapshots.loading}
	<p>Loading snapshots...</p>
{:else if !snapshots.current}
	<p>No snapshot payload returned.</p>
{:else if snapshots.current.length === 0}
	<p>No snapshots found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Sandbox</th>
				<th>Size Bytes</th>
				<th>Created</th>
			</tr>
		</thead>
		<tbody>
			{#each snapshots.current as snapshot}
				<tr>
					<td><a href={`/snapshots/${snapshot.id}`}>{snapshot.name}</a></td>
					<td>
						{#if snapshot.sandboxId}
							<a href={`/sandboxes/${snapshot.sandboxId}`}>{snapshot.sandboxName ?? `Sandbox #${snapshot.sandboxId}`}</a>
						{:else}
							n/a
						{/if}
					</td>
					<td>{snapshot.sizeBytes ?? 0}</td>
					<td>{snapshot.createdAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
