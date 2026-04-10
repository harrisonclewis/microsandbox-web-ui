<script lang="ts">
	import { getMigrations } from './data.remote';

	const migrations = getMigrations();
</script>

<svelte:head>
	<title>Settings Migrations | Microsandbox Web UI</title>
</svelte:head>

<h1>Settings / Migrations</h1>

{#if migrations.error}
	<p>Unable to load migrations.</p>
{:else if migrations.loading}
	<p>Loading migrations...</p>
{:else if !migrations.current}
	<p>No migration payload returned.</p>
{:else if migrations.current.length === 0}
	<p>No migration history found.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Version</th>
				<th>Applied At (epoch)</th>
			</tr>
		</thead>
		<tbody>
			{#each migrations.current as migration}
				<tr>
					<td>{migration.version}</td>
					<td>{migration.appliedAt}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
