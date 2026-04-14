<script lang="ts">
	import { page } from '$app/state';
	import StructuredJsonField from '$lib/components/forms/StructuredJsonField.svelte';
	import { stringArrayArgsSpec } from '$lib/json-fields/definitions.js';
	import { getSandboxRunsContext } from '../data.remote';
	import {
		streamCollect,
		streamKill,
		streamOpen,
		streamRecv,
		streamSignal,
		streamStdinClose,
		streamStdinTake,
		streamStdinWrite,
		streamWait
	} from '../actions.remote';

	const ctx = getSandboxRunsContext();

	let streamMode = $state<'exec' | 'shell'>('exec');
	let streamCmd = $state('sh');
	let streamArgsJson = $state('["-c","echo hi && sleep 1 && echo done"]');
	let signalNum = $state(15);
	let stdinText = $state('');

	const streamSession = $derived(page.url.searchParams.get('streamSession'));

	const sbName = $derived(ctx.current?.sandbox.name ?? '');
</script>

<svelte:head>
	<title>Streaming output | Microsandbox Web UI</title>
</svelte:head>

<div>
	{#if ctx.current?.sandbox}
		<fieldset>
			<legend>Streaming output</legend>
			<p>
				Open a long-running <code>exec</code> or <code>shell</code> session, then poll or stream events from the URL
				query.
			</p>
			{#if streamSession}
				<p>Active session: <code>{streamSession}</code></p>
				<form {...streamRecv}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamRecv.pending > 0}>Recv one event</button>
				</form>
				<form {...streamWait}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamWait.pending > 0}>Wait exit</button>
				</form>
				<form {...streamCollect}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamCollect.pending > 0}>Collect all</button>
				</form>
				<form {...streamKill}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamKill.pending > 0}>Kill stream</button>
				</form>
				<form {...streamSignal}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<label>Signal number <input type="text" name="signal" bind:value={signalNum} /></label>
					<button type="submit" disabled={streamSignal.pending > 0}>Send signal</button>
				</form>
				<form {...streamStdinTake}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamStdinTake.pending > 0}>Take stdin</button>
				</form>
				<form {...streamStdinWrite}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<label>Stdin UTF-8 <textarea name="dataUtf8" bind:value={stdinText} rows="2"></textarea></label>
					<button type="submit" disabled={streamStdinWrite.pending > 0}>Write stdin</button>
				</form>
				<form {...streamStdinClose}>
					<input type="hidden" name="sessionId" value={streamSession} />
					<button type="submit" disabled={streamStdinClose.pending > 0}>Close stdin</button>
				</form>
			{:else}
				<p>Open a stream first; the session id will appear in the URL.</p>
				<form {...streamOpen}>
					<input type="hidden" name="sandboxName" value={sbName} />
					<label>
						Mode
						<select name="mode" bind:value={streamMode}>
							<option value="exec">exec</option>
							<option value="shell">shell</option>
						</select>
					</label>
					<label>Program or script <input type="text" name="cmdOrScript" bind:value={streamCmd} /></label>
					<p>For <code>exec</code> mode only: extra arguments below.</p>
					<StructuredJsonField spec={stringArrayArgsSpec} bind:json={streamArgsJson} name="argsJson" />
					<button type="submit" disabled={streamOpen.pending > 0}>Open stream</button>
				</form>
			{/if}
		</fieldset>
	{/if}
</div>
