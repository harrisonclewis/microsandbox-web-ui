<script lang="ts">
	import { page } from '$app/state';
	import { getRunDetail } from './data.remote';

	const runDetail = getRunDetail();
	const runsHref = $derived(`/sandboxes/${page.params.sandboxId}/runs`);
</script>

<svelte:head>
	<title>Run Detail | Microsandbox Web UI</title>
</svelte:head>

<h2>
	{#if runDetail.current}
		Run #{runDetail.current.id}
	{:else}
		Run detail
	{/if}
</h2>

<p><a href={runsHref}>Back to run history</a></p>

{#if runDetail.error}
	<p>Unable to load run detail.</p>
{:else if runDetail.loading}
	<p>Loading run detail...</p>
{:else if !runDetail.current}
	<p>Run not found.</p>
{:else}
	<p>
		Sandbox:
		<a href={`/sandboxes/${runDetail.current.sandboxId}`}>{runDetail.current.sandboxName}</a>
	</p>
	<p>Status: {runDetail.current.status}</p>

	<dl>
		<dt>Run ID</dt>
		<dd>{runDetail.current.id}</dd>
		<dt>PID</dt>
		<dd>{runDetail.current.pid ?? 'n/a'}</dd>
		<dt>Exit Code</dt>
		<dd>{runDetail.current.exitCode ?? 'n/a'}</dd>
		<dt>Exit Signal</dt>
		<dd>{runDetail.current.exitSignal ?? 'n/a'}</dd>
		<dt>Termination Reason</dt>
		<dd>{runDetail.current.terminationReason ?? 'n/a'}</dd>
		<dt>Termination Detail</dt>
		<dd>{runDetail.current.terminationDetail ?? 'n/a'}</dd>
		<dt>Signals Sent</dt>
		<dd>{runDetail.current.signalsSent ?? 'n/a'}</dd>
		<dt>Started At</dt>
		<dd>{runDetail.current.startedAt ?? 'n/a'}</dd>
		<dt>Terminated At</dt>
		<dd>{runDetail.current.terminatedAt ?? 'n/a'}</dd>
	</dl>
{/if}
