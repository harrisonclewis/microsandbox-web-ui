<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
    import { SandboxStatus } from "$lib/types";
	import { getMetrics, getSandbox, killSandbox, removeSandbox, startSandbox, stopSandbox } from "./data.remote";

	const sandboxName = $derived(page.params.name!);
	const sandbox = $derived(getSandbox(sandboxName));
	const metrics = $derived(getMetrics(sandboxName));
	let actionError = $state<string | null>(null);

	async function runAction(action: () => Promise<unknown>): Promise<void> {
		actionError = null;

		try {
			await action();
			await sandbox.refresh();
			await metrics.refresh();
		} catch (error) {
			actionError = error instanceof Error ? error.message : "Action failed.";
		}
	}

	async function onStart(): Promise<void> {
		await runAction(() => startSandbox(sandboxName));
	}

	async function onStop(): Promise<void> {
		await runAction(() => stopSandbox(sandboxName));
	}

	async function onKill(): Promise<void> {
		await runAction(() => killSandbox(sandboxName));
	}

	async function onRemove(): Promise<void> {
		actionError = null;

		try {
			await removeSandbox(sandboxName);
			await goto("/dashboard");
		} catch (error) {
			actionError = error instanceof Error ? error.message : "Action failed.";
		}
	}
</script>

<svelte:head>
	<title>Sandbox {page.params.name}</title>
</svelte:head>

<h2>Sandbox</h2>

<p>
	<a href="/dashboard">Back to dashboard</a>
</p>

{#if actionError}
	<p>{actionError}</p>
{/if}

<RemoteState remote={sandbox}>
	{#snippet children(remote)}
		{#if remote.current?.data}		
			<ul>
				{#if remote.current.data.status === SandboxStatus.Running}
					<li>
						<button type="button" onclick={onStop} disabled={stopSandbox.pending > 0 || sandbox.loading}>
							Stop
						</button>
					</li>
					<li>
						<button type="button" onclick={onKill} disabled={killSandbox.pending > 0 || sandbox.loading}>
							Kill
						</button>
					</li>
				{:else if remote.current.data.status === SandboxStatus.Stopped}
					<li>
						<button type="button" onclick={onStart} disabled={startSandbox.pending > 0 || sandbox.loading}>
							Start
						</button>
					</li>
					<li>
						<button type="button" onclick={onRemove} disabled={removeSandbox.pending > 0 || sandbox.loading}>
							Remove
						</button>
					</li>
				{/if}
			</ul>

			<dl>
				<dt>Name</dt>
				<dd>{remote.current.data.name}</dd>

				<dt>Status</dt>
				<dd>{remote.current.data.status}</dd>

				{#if remote.current.data.status === SandboxStatus.Running}
					<dt>Metrics</dt>
					<dd>
						{#if metrics.error}
							<p>Failed to load metrics.</p>
						{:else if metrics.loading}
							<p>Loading metrics...</p>
						{:else if metrics.current?.data}
							<ul>
								<li>CPU: {metrics.current.data.cpuPercent}%</li>
								<li>Memory: {toCapacity(metrics.current.data.memoryBytes)}</li>
								<li>Memory Limit: {toCapacity(metrics.current.data.memoryLimitBytes)}</li>
								<li>Disk Read: {toCapacity(metrics.current.data.diskReadBytes)}</li>
								<li>Disk Write: {toCapacity(metrics.current.data.diskWriteBytes)}</li>
								<li>Network RX: {toCapacity(metrics.current.data.netRxBytes)}</li>
								<li>Network TX: {toCapacity(metrics.current.data.netTxBytes)}</li>
								<li>Uptime: {Math.floor(metrics.current.data.uptimeMs / 1000)}s</li>
							</ul>
						{:else}
							<p>No metrics available.</p>
						{/if}
					</dd>
				{/if}

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
