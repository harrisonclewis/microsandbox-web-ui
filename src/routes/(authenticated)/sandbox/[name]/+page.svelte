<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { toCapacity } from "$lib";
	import RemoteState from "$lib/components/remote-state.svelte";
	import { SandboxStatus } from "$lib/types";
	import { toast, ToastType } from "$lib/client/toasts";
	import { eventStream, type EventStreamHandle } from "$lib/client/stream.svelte";
	import type { SandboxMetrics } from "microsandbox";
	import { getSandbox, killSandbox, removeSandbox, startSandbox, stopSandbox } from "./data.remote";

	const sandboxName = $derived(page.params.name!);
	const sandbox = $derived(getSandbox(sandboxName));

	let metricsStream = $state<EventStreamHandle<SandboxMetrics> | null>(null);

	$effect(() => {
		if (sandbox.current?.data?.status !== SandboxStatus.Running) {
			metricsStream = null;
			return;
		}

		const stream = eventStream<SandboxMetrics>(
			resolve(`/sandbox/${encodeURIComponent(sandboxName)}/metrics/stream`),
			{ onEnd: () => void sandbox.refresh(), onError: () => void sandbox.refresh() },
		);

		metricsStream = stream;

		return () => stream.close();
	});

	async function runAction(action: () => Promise<unknown>, successMessage: string): Promise<void> {
		try {
			await action();

			toast({ type: ToastType.Success, message: successMessage });

			await sandbox.refresh();
		} catch (error) {
			toast({
				type: ToastType.Error,
				message: error instanceof Error ? error.message : "Action failed.",
			});
		}
	}

	async function onStart(): Promise<void> {
		await runAction(() => startSandbox(sandboxName), "Sandbox started");
	}

	async function onStop(): Promise<void> {
		await runAction(() => stopSandbox(sandboxName), "Sandbox stopped");
	}

	async function onKill(): Promise<void> {
		await runAction(() => killSandbox(sandboxName), "Sandbox killed");
	}

	async function onRemove(): Promise<void> {
		try {
			await removeSandbox(sandboxName);

			toast({ type: ToastType.Success, message: "Sandbox removed" });

			await goto("/dashboard");
		} catch (error) {
			toast({
				type: ToastType.Error,
				message: error instanceof Error ? error.message : "Failed to remove sandbox.",
			});
		}
	}
</script>

<h2>Sandbox</h2>

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
						{#if !metricsStream || metricsStream.state.kind === "connecting"}
							<p>Loading metrics...</p>
						{:else if metricsStream.state.kind === "error"}
							<p>Failed to load metrics.</p>
						{:else if metricsStream.state.kind === "ready"}
							<ul>
								<li>CPU: {metricsStream.state.data.cpuPercent.toFixed(2)}%</li>
								<li>Memory: {toCapacity(metricsStream.state.data.memoryBytes)}</li>
								<li>Memory Limit: {toCapacity(metricsStream.state.data.memoryLimitBytes)}</li>
								<li>Disk Read: {toCapacity(metricsStream.state.data.diskReadBytes)}</li>
								<li>Disk Write: {toCapacity(metricsStream.state.data.diskWriteBytes)}</li>
								<li>Network RX: {toCapacity(metricsStream.state.data.netRxBytes)}</li>
								<li>Network TX: {toCapacity(metricsStream.state.data.netTxBytes)}</li>
								<li>Uptime: {Math.floor(metricsStream.state.data.uptimeMs / 1000)}s</li>
							</ul>
						{/if}
					</dd>
				{/if}

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

				<dt>Updated</dt>
				<dd>
					{remote.current.data.updatedAt != null
						? new Date(remote.current.data.updatedAt).toLocaleString()
						: "-"}
				</dd>

				<dt>Created</dt>
				<dd>
					{remote.current.data.createdAt != null
						? new Date(remote.current.data.createdAt).toLocaleString()
						: "-"}
				</dd>
			</dl>
		{:else}
			<p>Sandbox not found.</p>
		{/if}
	{/snippet}
</RemoteState>
