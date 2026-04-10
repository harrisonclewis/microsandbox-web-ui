<script lang="ts">
	import { getSandboxes } from './data.remote';

	const sandboxes = getSandboxes();
</script>

<svelte:head>
	<title>Sandboxes | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandboxes</h1>
<p><a href="/sandboxes/new">View create schema preview</a></p>

{#if sandboxes.error}
	<p>Unable to load sandboxes.</p>
{:else if sandboxes.loading}
	<p>Loading sandboxes...</p>
{:else if !sandboxes.current}
	<p>No sandbox payload returned.</p>
{:else if sandboxes.current.length === 0}
	<p>No sandboxes found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Status</th>
				<th>Created</th>
				<th>Updated</th>
			</tr>
		</thead>
		<tbody>
			{#each sandboxes.current as sandbox}
				<tr>
					<td>{sandbox.id}</td>
					<td><a href={`/sandboxes/${sandbox.id}`}>{sandbox.name}</a></td>
					<td>{sandbox.status}</td>
					<td>{sandbox.createdAt ?? 'n/a'}</td>
					<td>{sandbox.updatedAt ?? 'n/a'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
