<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getImageDetail } from './data.remote';

	const detail = getImageDetail();
	const indexColumns = [
		{
			key: 'id',
			label: 'Index',
			sortable: true,
			type: 'link',
			text: (row: any) => `Index #${row.id}`,
			href: (row: any) => `/images/${detail.current?.image.id}/indexes/${row.id}`
		},
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'schemaVersion', label: 'Schema', sortable: true, empty: 'n/a' },
		{
			key: 'platform',
			label: 'Platform',
			value: (row: any) =>
				`${row.platformOs ?? 'n/a'} / ${row.platformArch ?? 'n/a'} / ${row.platformVariant ?? 'n/a'}`
		},
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
	const manifestColumns = [
		{
			key: 'id',
			label: 'Manifest',
			sortable: true,
			type: 'link',
			text: (row: any) => `Manifest #${row.id}`,
			href: (row: any) => `/images/${detail.current?.image.id}/manifests/${row.id}`
		},
		{ key: 'digest', label: 'Digest', sortable: true },
		{ key: 'mediaType', label: 'Media Type', sortable: true, empty: 'n/a' },
		{ key: 'schemaVersion', label: 'Schema', sortable: true, empty: 'n/a' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
	];
</script>

<svelte:head>
	<title>Image Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Image Detail</h1>

{#if detail.error}
	<p>Unable to load image detail.</p>
{:else if detail.loading}
	<p>Loading image detail...</p>
{:else if !detail.current}
	<p>No image payload returned.</p>
{:else if !detail.current.image}
	<p>Image not found.</p>
{:else}
	<section>
		<h2>{detail.current.image.reference}</h2>
		<dl>
			<dt>ID</dt>
			<dd>{detail.current.image.id}</dd>
			<dt>Size Bytes</dt>
			<dd>{detail.current.image.sizeBytes ?? 0}</dd>
			<dt>Last Used</dt>
			<dd>{detail.current.image.lastUsedAt ?? 'n/a'}</dd>
			<dt>Created</dt>
			<dd>{detail.current.image.createdAt ?? 'n/a'}</dd>
		</dl>
		<p>
			<a href={`/images/${detail.current.image.id}/manifests`}>Manifests</a>
		</p>
	</section>

	<section>
		<h2>Indexes</h2>
		{#if detail.current.indexes.data.length === 0}
			<p>No indexes found.</p>
		{:else}
			<DataTable
				namespace="indexes"
				data={detail.current.indexes.data}
				columns={indexColumns}
				currentSortBy={detail.current.indexes.sortBy}
				currentSortDir={detail.current.indexes.sortDir}
				defaultSortBy="createdAt"
				defaultSortDir="desc"
				currentPage={detail.current.indexes.page}
				totalPages={detail.current.indexes.totalPages}
			/>
		{/if}
	</section>

	<section>
		<h2>Recent Manifests</h2>
		{#if detail.current.manifests.data.length === 0}
			<p>No manifests found.</p>
		{:else}
			<DataTable
				namespace="manifests"
				data={detail.current.manifests.data}
				columns={manifestColumns}
				currentSortBy={detail.current.manifests.sortBy}
				currentSortDir={detail.current.manifests.sortDir}
				defaultSortBy="createdAt"
				defaultSortDir="desc"
				currentPage={detail.current.manifests.page}
				totalPages={detail.current.manifests.totalPages}
			/>
		{/if}
	</section>
{/if}
