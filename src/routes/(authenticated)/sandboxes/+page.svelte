<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { convertBytes } from '$lib';
	import { page } from '$app/state';
	import { getSandboxes } from './data.remote';

	const sandboxes = getSandboxes();
	const sdkCreated = $derived(page.url.searchParams.get('sdkCreated'));
	const sdkMode = $derived(page.url.searchParams.get('mode'));
</script>

<svelte:head>
	<title>Sandboxes | Microsandbox Web UI</title>
</svelte:head>

<h1>Sandboxes</h1>
{#if sdkCreated}
	<p role="status">
		SDK created sandbox <code>{sdkCreated}</code>{sdkMode ? ` (${sdkMode})` : ''}. Refresh the DB-backed list if your
		engine syncs asynchronously.
	</p>
{/if}
<p>
	<a href="/sandboxes/new">Create sandbox (SDK)</a>
	· <a href="/settings/sdk">SDK diagnostics</a>
</p>

<DataTable
	namespace="sandboxes"
	remotePagination={sandboxes}
	remoteLabels={{
		error: 'Unable to load sandboxes.',
		loading: 'Loading sandboxes...',
		noPayload: 'No sandbox payload returned.',
		empty: 'No sandboxes found.'
	}}
	columns={[
		{ key: 'id', label: 'ID', sortable: true },
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			type: 'link',
			href: (row: any) => `/sandboxes/${row.id}`
		},
		{
			key: 'cpus',
			label: 'CPUs',
			value: (row: any) => {
				const cpus = row.config?.data?.cpus;
				return cpus != null ? cpus : 'n/a';
			}
		},
		{
			key: 'imageOci',
			label: 'Image (OCI)',
			value: (row: any) => {
				const img = row.config?.data?.image;
				const ref = img?.Oci ?? img?.Path;
				return ref != null && ref !== '' ? ref : 'n/a';
			}
		},
		{
			key: 'memoryMib',
			label: 'Memory',
			value: (row: any) => {
				const mib = row.config?.data?.memory_mib;
				return mib != null ? convertBytes(mib * 1024 * 1024) : 'n/a';
			}
		},
		{ key: 'status', label: 'Status', sortable: true, type: 'status' },
		{ key: 'createdAt', label: 'Created', sortable: true, type: 'date' },
		{ key: 'updatedAt', label: 'Updated', sortable: true, type: 'date' }
	]}
/>
