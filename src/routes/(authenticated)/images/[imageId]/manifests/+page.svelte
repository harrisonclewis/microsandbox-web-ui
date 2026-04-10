<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getImageManifests } from './data.remote';

	const manifests = getImageManifests();
	const manifestColumns = [
		{
			key: 'id',
			label: 'Manifest',
			sortable: true,
			type: 'link',
			text: (row: any) => `Manifest #${row.id}`,
			href: (row: any) => `/images/${manifests.current?.image.id}/manifests/${row.id}`
		},
		{ key: 'digest', label: 'Digest', sortable: true },
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'schemaVersion', label: 'Schema', sortable: true, empty: 'n/a' },
		{ key: 'indexId', label: 'Index ID', sortable: true, empty: 'n/a' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Image Manifests | Microsandbox Web UI</title>
</svelte:head>

<h1>Image Manifests</h1>

{#if manifests.error}
	<p>Unable to load manifests.</p>
{:else if manifests.loading}
	<p>Loading manifests...</p>
{:else if !manifests.current}
	<p>No manifest payload returned.</p>
{:else if !manifests.current.image}
	<p>Image not found.</p>
{:else}
	<p>
		Image:
		<a href={`/images/${manifests.current.image.id}`}>{manifests.current.image.reference}</a>
	</p>

	{#if manifests.current.manifests.data.length === 0}
		<p>No manifests found.</p>
	{:else}
		<DataTable
			namespace="manifests"
			data={manifests.current.manifests.data}
			columns={manifestColumns}
			currentSortBy={manifests.current.manifests.sortBy}
			currentSortDir={manifests.current.manifests.sortDir}
			defaultSortBy="createdAt"
			defaultSortDir="desc"
			currentPage={manifests.current.manifests.page}
			totalPages={manifests.current.manifests.totalPages}
		/>
	{/if}
{/if}
