<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getDatabaseOverview } from './data.remote';

	const overview = getDatabaseOverview();
</script>

<svelte:head>
	<title>Settings Database | Microsandbox Web UI</title>
</svelte:head>

<h1>Settings / Database</h1>

<DataTable
	namespace="tables"
	remotePagination={overview}
	remoteLabels={{
		error: 'Unable to load database overview.',
		loading: 'Loading database overview...',
		noPayload: 'No database overview payload returned.',
		empty: 'No tables found.'
	}}
	columns={[
		{ key: 'table', label: 'Table', sortable: true },
		{ key: 'rows', label: 'Rows', sortable: true }
	]}
/>
