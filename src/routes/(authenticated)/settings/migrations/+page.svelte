<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getMigrations } from './data.remote';

	const migrations = getMigrations();
	const migrationColumns = [
		{ key: 'version', label: 'Version', sortable: true },
		{ key: 'appliedAt', label: 'Applied At (epoch)', sortable: true }
	];
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
{:else if migrations.current.data.length === 0}
	<p>No migration history found.</p>
{:else}
	<DataTable
		namespace="migrations"
		data={migrations.current.data}
		columns={migrationColumns}
		currentSortBy={migrations.current.sortBy}
		currentSortDir={migrations.current.sortDir}
		defaultSortBy="appliedAt"
		defaultSortDir="desc"
		currentPage={migrations.current.page}
		totalPages={migrations.current.totalPages}
	/>
{/if}
