<script lang="ts">
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import { installMicrosandboxRuntime } from './actions.remote';
	import { getSdkDiagnostics } from './data.remote';

	const diag = getSdkDiagnostics();
</script>

<svelte:head>
	<title>SDK diagnostics | Microsandbox Web UI</title>
</svelte:head>

<SdkUrlFeedback />

<h1>Microsandbox SDK</h1>
<p>
	<a href="/dashboard">Dashboard</a>
	· Native SDK runs on the app server (Linux x64/arm64 or macOS Apple Silicon).
</p>

{#if diag.error}
	<p>Unable to load diagnostics.</p>
{:else if diag.loading}
	<p>Loading…</p>
{:else if diag.current}
	<fieldset>
		<legend>Capabilities</legend>
		<ul>
			<li>Supported host: <strong>{String(diag.current.capabilities.supportedHost)}</strong></li>
			<li>Runtime installed: <strong>{String(diag.current.capabilities.installed)}</strong></li>
			<li>Snapshots API: <strong>{String(diag.current.capabilities.snapshots)}</strong> (not in current SDK)</li>
			<li>Guest events API: <strong>{String(diag.current.capabilities.events)}</strong> (not in current SDK)</li>
		</ul>
	</fieldset>

	{#if diag.current.sandboxes}
		<fieldset>
			<legend>SDK sandbox list</legend>
			{#if !diag.current.sandboxes.ok}
				<p role="alert">{diag.current.sandboxes.message}</p>
			{:else}
				<ul>
					{#each diag.current.sandboxes.data as s}
						<li><code>{s.name}</code> — {s.status}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>
	{/if}
{/if}

<fieldset>
	<legend>Install runtime on server</legend>
	<p>
		Set <code>MSB_ADMIN_INSTALL_TOKEN</code> in server environment, then submit the same value below. This downloads
		msb + libkrunfw (network required on the host).
	</p>
	{#if installMicrosandboxRuntime.fields.allIssues()?.length}
		<ul role="alert">
			{#each installMicrosandboxRuntime.fields.allIssues() ?? [] as issue}
				<li>{issue.message}</li>
			{/each}
		</ul>
	{/if}
	<form {...installMicrosandboxRuntime}>
		<label>
			Admin token
			<input {...installMicrosandboxRuntime.fields.adminToken.as('password')} autocomplete="off" />
		</label>
		<button type="submit" disabled={installMicrosandboxRuntime.pending > 0}>Run install()</button>
	</form>
</fieldset>
