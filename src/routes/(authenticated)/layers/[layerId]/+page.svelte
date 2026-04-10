<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getLayerDetail } from './data.remote';

	const detail = getLayerDetail();
	const usageColumns = [
		{
			key: 'imageReference',
			label: 'Image',
			sortable: true,
			type: 'link',
			href: (row: any) => `/images/${row.imageId}`
		},
		{
			key: 'manifestDigest',
			label: 'Manifest',
			sortable: true,
			type: 'link',
			href: (row: any) => `/images/${row.imageId}/manifests/${row.manifestId}`
		},
		{ key: 'position', label: 'Position', sortable: true }
	];
</script>

<svelte:head>
	<title>Layer Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Layer Detail</h1>

{#if detail.error}
	<p>Unable to load layer detail.</p>
{:else if detail.loading}
	<p>Loading layer detail...</p>
{:else if !detail.current}
	<p>No layer payload returned.</p>
{:else if !detail.current.layer}
	<p>Layer not found.</p>
{:else}
	<dl>
		<dt>Layer ID</dt>
		<dd>{detail.current.layer.id}</dd>
		<dt>Digest</dt>
		<dd>{detail.current.layer.digest}</dd>
		<dt>Diff ID</dt>
		<dd>{detail.current.layer.diffId}</dd>
		<dt>Media Type</dt>
		<dd>{detail.current.layer.mediaType ?? 'n/a'}</dd>
		<dt>Size Bytes</dt>
		<dd>{detail.current.layer.sizeBytes ?? 0}</dd>
		<dt>Created</dt>
		<dd>{detail.current.layer.createdAt ?? 'n/a'}</dd>
	</dl>

	<h2>Where Used</h2>
	{#if detail.current.usage.data.length === 0}
		<p>This layer is not attached to any manifest.</p>
	{:else}
		<DataTable
			namespace="usage"
			data={detail.current.usage.data}
			columns={usageColumns}
			currentSortBy={detail.current.usage.sortBy}
			currentSortDir={detail.current.usage.sortDir}
			defaultSortBy="position"
			defaultSortDir="desc"
			currentPage={detail.current.usage.page}
			totalPages={detail.current.usage.totalPages}
		/>
	{/if}
{/if}
