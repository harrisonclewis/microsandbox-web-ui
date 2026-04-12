<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getImages } from './data.remote';

	const images = getImages();
</script>

<svelte:head>
	<title>Images | Microsandbox Web UI</title>
</svelte:head>

<h1>Images</h1>
<p><a href="/images/new">View import schema preview</a></p>

<DataTable
	namespace="images"
	remotePagination={images}
	remoteLabels={{
		error: 'Unable to load images.',
		loading: 'Loading images...',
		noPayload: 'No image payload returned.',
		empty: 'No images found.'
	}}
	columns={[
		{
			key: 'reference',
			label: 'Reference',
			sortable: true,
			type: 'link',
			href: (row: any) => `/images/${row.id}`
		},
		{ key: 'sizeBytes', label: 'Size Bytes', sortable: true, empty: '0' },
		{ key: 'lastUsedAt', label: 'Last Used', sortable: true, type: 'date' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	]}
/>
