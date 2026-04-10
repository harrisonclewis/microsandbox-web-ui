<script lang="ts">
	import { getSandboxDetail } from './data.remote';

	const detail = getSandboxDetail();
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
		{#if detail.current.linkedImages.length === 0}
			<p>No linked images.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Image</th>
						<th>Manifest Digest</th>
						<th>Linked At</th>
					</tr>
				</thead>
				<tbody>
					{#each detail.current.linkedImages as image}
						<tr>
							<td><a href={`/images/${image.imageId}`}>{image.imageReference}</a></td>
							<td>{image.manifestDigest}</td>
							<td>{image.createdAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section>
		<h2>Recent Runs</h2>
		{#if detail.current.latestRuns.length === 0}
			<p>No runs recorded.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Run</th>
						<th>Status</th>
						<th>Exit</th>
						<th>Reason</th>
						<th>Started</th>
						<th>Ended</th>
					</tr>
				</thead>
				<tbody>
					{#each detail.current.latestRuns as run}
						<tr>
							<td><a href={`/sandboxes/${detail.current.sandbox.id}/runs/${run.id}`}>Run #{run.id}</a></td>
							<td>{run.status}</td>
							<td>{run.exitCode ?? 'n/a'}</td>
							<td>{run.terminationReason ?? 'n/a'}</td>
							<td>{run.startedAt ?? 'n/a'}</td>
							<td>{run.terminatedAt ?? 'n/a'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
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
