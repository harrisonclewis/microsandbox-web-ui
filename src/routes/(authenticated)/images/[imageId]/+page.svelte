<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getImageDetail } from './data.remote';

	const detail = getImageDetail();

	const imageIndexesRemote = {
		get current() {
			return detail.current?.indexes;
		},
		refresh: () => detail.refresh()
	};

	const imageManifestsRemote = {
		get current() {
			return detail.current?.manifests;
		},
		refresh: () => detail.refresh()
	};
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
		<DataTable
			namespace="indexes"
			remotePagination={imageIndexesRemote}
			remoteLabels={{
				empty: 'No indexes found.'
			}}
			columns={[
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
			]}
		/>
	</section>

	<section>
		<h2>Recent Manifests</h2>
		<DataTable
			namespace="manifests"
			remotePagination={imageManifestsRemote}
			remoteLabels={{
				empty: 'No manifests found.'
			}}
			columns={[
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
			]}
		/>
	</section>
{/if}
