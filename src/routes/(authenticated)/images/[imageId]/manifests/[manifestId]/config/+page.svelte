<script lang="ts">
	import { getManifestConfig } from './data.remote';

	const config = getManifestConfig();
</script>

<svelte:head>
	<title>Manifest Config | Microsandbox Web UI</title>
</svelte:head>

<h1>Manifest Config</h1>

{#if config.error}
	<p>Unable to load config data.</p>
{:else if config.loading}
	<p>Loading config data...</p>
{:else if !config.current}
	<p>Manifest not found.</p>
{:else}
	<p>Manifest: {config.current.manifestDigest}</p>

	{#if !config.current.configId}
		<p>No config row exists for this manifest.</p>
	{:else}
		<dl>
			<dt>Config Digest</dt>
			<dd>{config.current.digest}</dd>
			<dt>Architecture</dt>
			<dd>{config.current.architecture ?? 'n/a'}</dd>
			<dt>OS</dt>
			<dd>{config.current.os ?? 'n/a'}</dd>
			<dt>OS Variant</dt>
			<dd>{config.current.osVariant ?? 'n/a'}</dd>
			<dt>User</dt>
			<dd>{config.current.user ?? 'n/a'}</dd>
			<dt>Working Directory</dt>
			<dd>{config.current.workingDir ?? 'n/a'}</dd>
			<dt>Entrypoint</dt>
			<dd>{config.current.entrypoint ?? 'n/a'}</dd>
			<dt>Command</dt>
			<dd>{config.current.cmd ?? 'n/a'}</dd>
			<dt>Environment</dt>
			<dd>{config.current.env ?? 'n/a'}</dd>
			<dt>Volumes</dt>
			<dd>{config.current.volumes ?? 'n/a'}</dd>
			<dt>Exposed Ports</dt>
			<dd>{config.current.exposedPorts ?? 'n/a'}</dd>
			<dt>RootFS Type</dt>
			<dd>{config.current.rootfsType ?? 'n/a'}</dd>
			<dt>RootFS Diff IDs</dt>
			<dd>{config.current.rootfsDiffIds ?? 'n/a'}</dd>
			<dt>History</dt>
			<dd>{config.current.history ?? 'n/a'}</dd>
			<dt>Created</dt>
			<dd>{config.current.createdAt ?? 'n/a'}</dd>
		</dl>
	{/if}
{/if}
