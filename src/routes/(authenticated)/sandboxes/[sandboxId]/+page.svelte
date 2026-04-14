<script lang="ts">
	import { formatMib } from '$lib';
	import DataTable from '$lib/components/table/DataTable.svelte';
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import { getSandboxDetail, getSandboxSdkLive } from './data.remote';
	import {
		detachSandbox,
		drainSandbox,
		killSandbox,
		removePersistedSandbox,
		removeStoppedSandbox,
		startSandboxAttached,
		startSandboxDetached,
		stopAndWaitSandbox,
		stopSandbox,
		waitSandbox
	} from './actions.remote';

	const detail = getSandboxDetail();
	const sdkLive = getSandboxSdkLive();

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

	const sbName = $derived(detail.current?.sandbox.name ?? '');
</script>

<svelte:head>
	<title>Sandbox Detail | Microsandbox Web UI</title>
</svelte:head>

<SdkUrlFeedback />

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
			<dt>Engine config</dt>
			<dd>
				{#if detail.current.sandbox.config.error}
					<p role="alert">{detail.current.sandbox.config.error}</p>
					<pre>{detail.current.sandbox.config.raw}</pre>
				{:else if detail.current.sandbox.config.data}
					<dl>
						<dt>Image</dt>
						<dd>
							{detail.current.sandbox.config.data.image?.Oci ?? detail.current.sandbox.config.data.image?.Path ?? '—'}
						</dd>
						{#if detail.current.sandbox.config.data.cpus != null}
							<dt>CPUs</dt>
							<dd>{detail.current.sandbox.config.data.cpus}</dd>
						{/if}
						{#if detail.current.sandbox.config.data.memory_mib != null}
							<dt>Memory</dt>
							<dd>{formatMib(detail.current.sandbox.config.data.memory_mib)}</dd>
						{/if}
						{#if detail.current.sandbox.config.data.workdir}
							<dt>Workdir</dt>
							<dd>{detail.current.sandbox.config.data.workdir}</dd>
						{/if}
					</dl>
					<details>
						<summary>Full JSON</summary>
						<pre>{JSON.stringify(detail.current.sandbox.config.data, null, 2)}</pre>
					</details>
				{:else}
					<pre>{detail.current.sandbox.config.raw}</pre>
				{/if}
			</dd>
		</dl>
		<nav aria-label="Sandbox sections">
			<ul>
				<li><a href={`/sandboxes/${detail.current.sandbox.id}/runs`}>Runs &amp; exec</a></li>
				<li><a href={`/sandboxes/${detail.current.sandbox.id}/files`}>Files</a></li>
				<li><a href={`/sandboxes/${detail.current.sandbox.id}/metrics`}>Metrics</a></li>
				<li><a href={`/sandboxes/${detail.current.sandbox.id}/images`}>Images</a></li>
				<li><a href={`/sandboxes/${detail.current.sandbox.id}/snapshots`}>Snapshots</a></li>
			</ul>
		</nav>
	</section>

	<fieldset>
		<legend>SDK (live)</legend>
		{#if sdkLive.error}
			<p>Could not load SDK live data.</p>
		{:else if sdkLive.loading}
			<p>Loading SDK data…</p>
		{:else if sdkLive.current}
			{#if !sdkLive.current.capabilities.supportedHost}
				<p>SDK host not supported on this server OS/arch.</p>
			{:else if !sdkLive.current.capabilities.installed}
				<p>SDK runtime not installed. <a href="/settings/sdk">Open SDK settings</a>.</p>
			{:else if sdkLive.current.handle && !sdkLive.current.handle.ok}
				<p role="alert">Handle: {sdkLive.current.handle.message}</p>
			{:else if sdkLive.current.handle?.ok}
				<dl>
					<dt>SDK status</dt>
					<dd>{sdkLive.current.handle.data.status}</dd>
					{#if sdkLive.current.metrics && sdkLive.current.metrics.ok}
						<dt>CPU %</dt>
						<dd>{sdkLive.current.metrics.data.cpuPercent}</dd>
						<dt>Memory</dt>
						<dd>
							{sdkLive.current.metrics.data.memoryBytes} / {sdkLive.current.metrics.data.memoryLimitBytes} bytes
						</dd>
					{:else if sdkLive.current.metrics && !sdkLive.current.metrics.ok}
						<dt>Metrics</dt>
						<dd role="alert">{sdkLive.current.metrics.message}</dd>
					{/if}
				</dl>
			{:else}
				<p>No SDK handle loaded.</p>
			{/if}
		{/if}
	</fieldset>

	<fieldset>
		<legend>Lifecycle (SDK)</legend>
		<p>Uses sandbox name <code>{sbName}</code>. DB status may differ until your engine syncs.</p>

		<div>
			<form {...startSandboxAttached}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={startSandboxAttached.pending > 0}>Start (attached)</button>
			</form>
			<form {...startSandboxDetached}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={startSandboxDetached.pending > 0}>Start (detached)</button>
			</form>
			<form {...stopSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={stopSandbox.pending > 0}>Stop</button>
			</form>
			<form {...stopAndWaitSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={stopAndWaitSandbox.pending > 0}>Stop &amp; wait</button>
			</form>
			<form {...drainSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={drainSandbox.pending > 0}>Drain</button>
			</form>
			<form {...waitSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={waitSandbox.pending > 0}>Wait exit</button>
			</form>
			<form {...detachSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<button type="submit" disabled={detachSandbox.pending > 0}>Detach</button>
			</form>
			<form {...killSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<input type="hidden" name="confirm" value="KILL" />
				<button type="submit" disabled={killSandbox.pending > 0}>Kill</button>
			</form>
			<form {...removeStoppedSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<input type="hidden" name="confirm" value="REMOVE_STOPPED" />
				<button type="submit" disabled={removeStoppedSandbox.pending > 0}>Remove (stopped)</button>
			</form>
			<form {...removePersistedSandbox}>
				<input type="hidden" name="sandboxName" value={sbName} />
				<input type="hidden" name="confirm" value="REMOVE_PERSISTED" />
				<button type="submit" disabled={removePersistedSandbox.pending > 0}>Remove persisted</button>
			</form>
		</div>
		{#each [startSandboxAttached, startSandboxDetached, stopSandbox, stopAndWaitSandbox, drainSandbox, waitSandbox, detachSandbox, killSandbox, removeStoppedSandbox, removePersistedSandbox] as act}
			{#if act.fields.allIssues()?.length}
				<ul role="alert">
					{#each act.fields.allIssues() ?? [] as issue}
						<li>{issue.message}</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</fieldset>

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
		<h2>Snapshots (DB)</h2>
		<p>
			VM snapshot/fork APIs are not exposed in <code>microsandbox@0.3.12</code>; this list is the read model only.
		</p>
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
