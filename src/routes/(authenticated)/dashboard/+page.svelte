<script lang="ts">
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
	import Table from "$lib/components/table.svelte";
	import { getSandboxes } from "./data.remote";

	const sandboxes = getSandboxes();
</script>
<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<h2>Dashboard</h2>

<h3>Sandboxes</h3>

<ul>
	<li>
		<a href="/sandbox/create">Create Sandbox</a>
	</li>
</ul>

<RemoteState remote={sandboxes}>
	{#snippet children(remote)}
		<Table 
			columns={[
				{ label: "Name", key: "name" },
				{ 
					label: "CPUs", 
					key: "config.cpus", 
					value: (row) => row.config?.cpus ?? "-" 
				},
				{
					label: "Memory",
					key: "config.memory_mib",
					value: (row) => row.config?.memory_mib != null ? toCapacity(row.config.memory_mib, "mib") : "-",
				},
				{ 
					label: "Image", 
					key: "config.image", 
					value: (row) => row.config?.image?.Oci ?? "-" 
				},
				{ label: "Status", key: "status" },
			]} 
			data={remote.current?.data ?? []} 
		/>
	{/snippet}
</RemoteState>