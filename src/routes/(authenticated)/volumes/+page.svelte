<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getVolumes } from './data.remote';

	const volumes = getVolumes();
</script>

<svelte:head>
	<title>Volumes | Microsandbox Web UI</title>
</svelte:head>

<h1>Volumes</h1>
<p><a href="/volumes/new">View create schema preview</a></p>

<DataTable
	namespace="volumes"
	remotePagination={volumes}
	remoteLabels={{
		error: 'Unable to load volumes.',
		loading: 'Loading volumes...',
		noPayload: 'No volume payload returned.',
		empty: 'No volumes found.'
	}}
	columns={[
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/volumes/${row.id}`
		},
		{ key: 'quotaMib', label: 'Quota MiB', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'labels', label: 'Labels', empty: 'n/a' },
		{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
	]}
/>
