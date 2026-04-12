<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getMigrations } from './data.remote';

	const migrations = getMigrations();
</script>

<svelte:head>
	<title>Settings Migrations | Microsandbox Web UI</title>
</svelte:head>

<h1>Settings / Migrations</h1>

<DataTable
	namespace="migrations"
	remotePagination={migrations}
	remoteLabels={{
		error: 'Unable to load migrations.',
		loading: 'Loading migrations...',
		noPayload: 'No migration payload returned.',
		empty: 'No migration history found.'
	}}
	columns={[
		{ key: 'version', label: 'Version', sortable: true },
		{ key: 'appliedAt', label: 'Applied At (epoch)', sortable: true }
	]}
/>
