<script lang="ts">
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
	import Table from "$lib/components/table.svelte";
	import { SandboxStatus, type SandboxInfoWithConfig } from "$lib/types";
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

{#snippet sandboxName(sandbox: SandboxInfoWithConfig)}
	<a href={`/sandbox/${sandbox.name}`}>{sandbox.name}</a>
{/snippet}

{#snippet sandboxState(sandbox: SandboxInfoWithConfig)}
	<span class={`badge badge-${sandbox.status}`}>{sandbox.status}</span>
{/snippet}

{#snippet sandboxAction(sandbox: SandboxInfoWithConfig)}
	{#if sandbox.status === SandboxStatus.Stopped}
		<button type="button" class="action-button">Start</button>
	{:else if sandbox.status === SandboxStatus.Running}
		<button type="button" class="action-button action-danger">Stop</button>
	{/if}
{/snippet}

<RemoteState remote={sandboxes}>
	{#snippet children(remote)}
		<Table 
			columns={[
				{ label: "Name", key: "name", render: sandboxName },
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
				{ label: "State", key: "status", render: sandboxState },
				{ label: "Created", key: "createdAt", value: (row) => row.createdAt != null ? new Date(row.createdAt).toLocaleString() : "-" },
				{ label: "", key: "action", render: sandboxAction },
			]} 
			data={remote.current?.data ?? []} 
		/>
	{/snippet}
</RemoteState>