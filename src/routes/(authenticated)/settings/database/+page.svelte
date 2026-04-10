<script lang="ts">
	import { getDatabaseOverview } from './data.remote';

	const overview = getDatabaseOverview();
</script>

<svelte:head>
	<title>Settings Database | Microsandbox Web UI</title>
</svelte:head>

<h1>Settings / Database</h1>

{#if overview.error}
	<p>Unable to load database overview.</p>
{:else if overview.loading}
	<p>Loading database overview...</p>
{:else if !overview.current}
	<p>No database overview payload returned.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Table</th>
				<th>Rows</th>
			</tr>
		</thead>
		<tbody>
			{#each overview.current as table}
				<tr>
					<td>{table.table}</td>
					<td>{table.rows}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
