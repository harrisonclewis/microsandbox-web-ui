<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getDatabaseOverview } from './data.remote';

	const overview = getDatabaseOverview();
	const tableColumns = [
		{ key: 'table', label: 'Table', sortable: true },
		{ key: 'rows', label: 'Rows', sortable: true }
	];
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
	<DataTable
		namespace="tables"
		data={overview.current.data}
		columns={tableColumns}
		currentSortBy={overview.current.sortBy}
		currentSortDir={overview.current.sortDir}
		defaultSortBy="table"
		defaultSortDir="asc"
		currentPage={overview.current.page}
		totalPages={overview.current.totalPages}
	/>
{/if}
