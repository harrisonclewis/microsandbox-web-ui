<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getLayers } from './data.remote';

	const layers = getLayers();
</script>

<svelte:head>
	<title>Layers | Microsandbox Web UI</title>
</svelte:head>

<h1>Layers</h1>

<DataTable
	namespace="layers"
	remotePagination={layers}
	remoteLabels={{
		error: 'Unable to load layers.',
		loading: 'Loading layers...',
		noPayload: 'No layer payload returned.',
		empty: 'No layers found.'
	}}
	columns={[
		{
			key: 'id',
			label: 'Layer',
			sortable: true,
			type: 'link',
			text: (row: any) => `Layer #${row.id}`,
			href: (row: any) => `/layers/${row.id}`
		},
		{ key: 'digest', label: 'Digest', sortable: true },
		{ key: 'diffId', label: 'Diff ID', sortable: true },
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	]}
/>
