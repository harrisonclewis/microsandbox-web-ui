<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { getSandboxDetail } from './data.remote';

	const detail = getSandboxDetail();

	const sandboxLinkedImagesRemote = {
		get current() {
			return detail.current?.linkedImages;
		},
		refresh: () => detail.refresh()
	};

	const sandboxLatestRunsRemote = {
		get current() {
			return detail.current?.latestRuns;
		},
		refresh: () => detail.refresh()
	};
</script>

<svelte:head>
	<title>Sandbox Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandbox</h1>

{#if detail.error}
	<p>Unable to load sandbox detail.</p>
{:else if detail.loading}
	<p>Loading sandbox...</p>
{:else if !detail.current}
	<p>No sandbox payload returned.</p>
{:else}
	<section>
		<h2>{detail.current.sandbox.name}</h2>
		<p>Status: {detail.current.sandbox.status}</p>
		<dl>
			<dt>ID</dt>
			<dd>{detail.current.sandbox.id}</dd>
			<dt>Created</dt>
			<dd>{detail.current.sandbox.createdAt ?? 'n/a'}</dd>
			<dt>Updated</dt>
			<dd>{detail.current.sandbox.updatedAt ?? 'n/a'}</dd>
			<dt>Config</dt>
			<dd>{detail.current.sandbox.config}</dd>
		</dl>
		<p>
			<a href={`/sandboxes/${detail.current.sandbox.id}/runs`}>Runs</a>
			<a href={`/sandboxes/${detail.current.sandbox.id}/metrics`}>Metrics</a>
			<a href={`/sandboxes/${detail.current.sandbox.id}/images`}>Images</a>
			<a href={`/sandboxes/${detail.current.sandbox.id}/snapshots`}>Snapshots</a>
		</p>
	</section>

	<section>
		<h2>Linked Images</h2>
		<DataTable
			namespace="images"
			remotePagination={sandboxLinkedImagesRemote}
			remoteLabels={{
				empty: 'No linked images.'
			}}
			columns={[
				{
					key: 'imageReference',
					label: 'Image',
					sortable: true,
					type: 'link',
					href: (row: any) => `/images/${row.imageId}`
				},
				{ key: 'manifestDigest', label: 'Manifest Digest', sortable: true },
				{ key: 'createdAt', label: 'Linked At', sortable: true, type: 'date' }
			]}
		/>
	</section>

	<section>
		<h2>Recent Runs</h2>
		<DataTable
			namespace="runs"
			remotePagination={sandboxLatestRunsRemote}
			remoteLabels={{
				empty: 'No runs recorded.'
			}}
			columns={[
				{
					key: 'id',
					label: 'Run',
					sortable: true,
					type: 'link',
					text: (row: any) => `Run #${row.id}`,
					href: (row: any) => `/sandboxes/${detail.current?.sandbox.id}/runs/${row.id}`
				},
				{ key: 'status', label: 'Status', sortable: true, type: 'status' },
				{ key: 'exitCode', label: 'Exit', sortable: true, empty: 'n/a' },
				{ key: 'terminationReason', label: 'Reason', sortable: true, empty: 'n/a' },
				{ key: 'startedAt', label: 'Started', sortable: true, type: 'date' },
				{ key: 'terminatedAt', label: 'Ended', sortable: true, type: 'date' }
			]}
		/>
	</section>

	<section>
		<h2>Snapshots</h2>
		{#if detail.current.snapshots.length === 0}
			<p>No snapshots found.</p>
		{:else}
			<ul>
				{#each detail.current.snapshots as snapshot}
					<li>
						<a href={`/snapshots/${snapshot.id}`}>{snapshot.name}</a>
						({snapshot.sizeBytes ?? 0} bytes, {snapshot.createdAt ?? 'n/a'})
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
