<script lang="ts">
	import SdkSnapshotsGate from '$lib/components/sdk/SdkSnapshotsGate.svelte';
	import { getSnapshotDetail } from './data.remote';

	const detail = getSnapshotDetail();
</script>

<svelte:head>
	<title>Snapshot Detail | Microsandbox Web UI</title>
</svelte:head>

<h1>Snapshot Detail</h1>

<SdkSnapshotsGate />

{#if detail.error}
	<p>Unable to load snapshot detail.</p>
{:else if detail.loading}
	<p>Loading snapshot detail...</p>
{:else if !detail.current}
	<p>Snapshot not found.</p>
{:else}
	<dl>
		<dt>Snapshot ID</dt>
		<dd>{detail.current.id}</dd>
		<dt>Name</dt>
		<dd>{detail.current.name}</dd>
		<dt>Description</dt>
		<dd>{detail.current.description ?? 'n/a'}</dd>
		<dt>Size Bytes</dt>
		<dd>{detail.current.sizeBytes ?? 0}</dd>
		<dt>Created</dt>
		<dd>{detail.current.createdAt ?? 'n/a'}</dd>
		<dt>Sandbox</dt>
		<dd>
			{#if detail.current.sandboxId}
				<a href={`/sandboxes/${detail.current.sandboxId}`}>
					{detail.current.sandboxName ?? `Sandbox #${detail.current.sandboxId}`}
				</a>
			{:else}
				n/a
			{/if}
		</dd>
	</dl>

	<section>
		<h2>Restore/Delete</h2>
		<p>Restore and delete actions are intentionally not implemented in this read-only phase.</p>
	</section>
{/if}
