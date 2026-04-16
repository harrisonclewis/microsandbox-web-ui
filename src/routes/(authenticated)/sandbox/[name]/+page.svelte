<script lang="ts">
	import { page } from "$app/state";
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
	import { getSandbox } from "./data.remote";

	const sandbox = $derived(getSandbox(page.params.name!));
</script>

<svelte:head>
	<title>Sandbox {page.params.name}</title>
</svelte:head>

<h2>Sandbox</h2>

<p>
	<a href="/dashboard">Back to dashboard</a>
</p>

<RemoteState remote={sandbox}>
	{#snippet children(remote)}
		{#if remote.current?.data}
			<dl>
				<dt>Name</dt>
				<dd>{remote.current.data.name}</dd>

				<dt>Status</dt>
				<dd>{remote.current.data.status}</dd>

				<dt>Created</dt>
				<dd>
					{remote.current.data.createdAt != null
						? new Date(remote.current.data.createdAt).toLocaleString()
						: "-"}
				</dd>

				<dt>Updated</dt>
				<dd>
					{remote.current.data.updatedAt != null
						? new Date(remote.current.data.updatedAt).toLocaleString()
						: "-"}
				</dd>

				<dt>Image</dt>
				<dd>{remote.current.data.config?.image?.Oci ?? "-"}</dd>

				<dt>CPUs</dt>
				<dd>{remote.current.data.config?.cpus ?? "-"}</dd>

				<dt>Memory</dt>
				<dd>
					{remote.current.data.config?.memory_mib != null
						? toCapacity(remote.current.data.config.memory_mib, "mib")
						: "-"}
				</dd>
			</dl>
		{:else}
			<p>Sandbox not found.</p>
		{/if}
	{/snippet}
</RemoteState>
