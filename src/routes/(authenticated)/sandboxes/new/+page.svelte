<script lang="ts">
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import StructuredJsonField from '$lib/components/forms/StructuredJsonField.svelte';
	import {
		networkCustomSpec,
		patchesArraySpec,
		sandboxLabelsSpec
	} from '$lib/json-fields/definitions.js';
	import { createSandbox } from '../actions.remote';
	type Pair = { key: string; value: string };
	type MountRow = {
		guestPath: string;
		type: 'bind' | 'named' | 'tmpfs';
		bindHostPath: string;
		namedVolume: string;
		tmpfsSizeMib: string;
		readonly: boolean;
	};
	type SecretRow = {
		envVar: string;
		value: string;
		allowHosts: string;
		allowHostPatterns: string;
		placeholder: string;
		requireTls: string;
		onViolation: string;
	};

	let name = $state('');
	let image = $state('');
	let detached = $state(false);
	let replace = $state(false);
	let cpus = $state('');
	let memoryMib = $state('');
	let workdir = $state('');
	let shell = $state('');
	let hostname = $state('');
	let user = $state('');
	let maxDurationSecs = $state('');
	let entrypointText = $state('');
	let cmdText = $state('');
	let pullPolicy = $state('if-missing');
	let logLevel = $state('');
	let quietLogs = $state(false);
	let stopSignal = $state('');
	let registryUser = $state('');
	let registryPass = $state('');
	let networkMode = $state<'none' | 'publicOnly' | 'allowAll' | 'custom'>('publicOnly');
	let networkCustomJson = $state('{}');
	let patchesJson = $state('[]');
	let labelsJson = $state('{}');

	let envRows = $state<Pair[]>([{ key: '', value: '' }]);
	let scriptRows = $state<Pair[]>([{ key: '', value: '' }]);
	let portRows = $state<Pair[]>([{ key: '8080', value: '80' }]);
	let mountRows = $state<MountRow[]>([
		{ guestPath: '', type: 'bind', bindHostPath: '', namedVolume: '', tmpfsSizeMib: '', readonly: false }
	]);
	let secretRows = $state<SecretRow[]>([
		{
			envVar: '',
			value: '',
			allowHosts: '',
			allowHostPatterns: '',
			placeholder: '',
			requireTls: 'true',
			onViolation: ''
		}
	]);

	function splitLines(s: string): string[] | undefined {
		const lines = s
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);
		return lines.length ? lines : undefined;
	}

	function pairsToRecord(rows: Pair[]): Record<string, string> | undefined {
		const o: Record<string, string> = {};
		for (const r of rows) {
			if (r.key.trim()) o[r.key.trim()] = r.value;
		}
		return Object.keys(o).length ? o : undefined;
	}

	function parseLabelsRecord(s: string): Record<string, string> | undefined {
		if (!s.trim()) return undefined;
		try {
			const j = JSON.parse(s) as unknown;
			if (typeof j !== 'object' || j === null || Array.isArray(j)) return undefined;
			const o: Record<string, string> = {};
			for (const [k, v] of Object.entries(j as Record<string, unknown>)) {
				if (typeof v === 'string') o[k] = v;
			}
			return Object.keys(o).length ? o : undefined;
		} catch {
			return undefined;
		}
	}

	function buildPayload(): Record<string, unknown> {
		const payload: Record<string, unknown> = {
			name: name.trim(),
			image: image.trim(),
			...(detached ? { detached: true } : {}),
			...(replace ? { replace: true } : {}),
			...(cpus !== '' && !Number.isNaN(Number(cpus)) ? { cpus: Number(cpus) } : {}),
			...(memoryMib !== '' && !Number.isNaN(Number(memoryMib)) ? { memoryMib: Number(memoryMib) } : {}),
			...(workdir.trim() ? { workdir: workdir.trim() } : {}),
			...(shell.trim() ? { shell: shell.trim() } : {}),
			...(hostname.trim() ? { hostname: hostname.trim() } : {}),
			...(user.trim() ? { user: user.trim() } : {}),
			...(maxDurationSecs !== '' && !Number.isNaN(Number(maxDurationSecs))
				? { maxDurationSecs: Number(maxDurationSecs) }
				: {}),
			...(splitLines(entrypointText) ? { entrypoint: splitLines(entrypointText) } : {}),
			...(splitLines(cmdText) ? { cmd: splitLines(cmdText) } : {}),
			...(pullPolicy ? { pullPolicy } : {}),
			...(logLevel.trim() ? { logLevel: logLevel.trim() } : {}),
			...(quietLogs ? { quietLogs: true } : {}),
			...(stopSignal.trim() ? { stopSignal: stopSignal.trim() } : {}),
			...(registryUser.trim() && registryPass
				? { registryAuth: { username: registryUser.trim(), password: registryPass } }
				: {}),
			...(pairsToRecord(envRows) ? { env: pairsToRecord(envRows) } : {}),
			...(pairsToRecord(scriptRows) ? { scripts: pairsToRecord(scriptRows) } : {}),
			...(parseLabelsRecord(labelsJson) ? { labels: parseLabelsRecord(labelsJson) } : {})
		};

		const ports: Record<string, number> = {};
		for (const p of portRows) {
			const h = p.key.trim();
			const g = Number(p.value);
			if (h && !Number.isNaN(g)) ports[h] = g;
		}
		if (Object.keys(ports).length) payload.ports = ports;

		const mounts = mountRows
			.filter((m) => m.guestPath.trim())
			.map((m) => ({
				guestPath: m.guestPath.trim(),
				type: m.type,
				...(m.type === 'bind' && m.bindHostPath.trim() ? { bindHostPath: m.bindHostPath.trim() } : {}),
				...(m.type === 'named' && m.namedVolume.trim() ? { namedVolume: m.namedVolume.trim() } : {}),
				...(m.type === 'tmpfs' && m.tmpfsSizeMib.trim() && !Number.isNaN(Number(m.tmpfsSizeMib))
					? { tmpfsSizeMib: Number(m.tmpfsSizeMib) }
					: {}),
				...(m.readonly ? { readonly: true } : {})
			}));
		if (mounts.length) payload.mounts = mounts;

		if (networkMode === 'custom') {
			try {
				const cfg = JSON.parse(networkCustomJson) as unknown;
				if (typeof cfg !== 'object' || cfg === null || Array.isArray(cfg)) {
					throw new Error('Invalid custom network JSON');
				}
				payload.network = { mode: 'custom' as const, config: cfg as import('microsandbox').NetworkConfig };
			} catch (e) {
				throw new Error(e instanceof Error ? e.message : 'Invalid custom network JSON');
			}
		} else {
			payload.network = { mode: networkMode };
		}

		const secrets = secretRows
			.filter((s) => s.envVar.trim() && s.value)
			.map((s) => ({
				envVar: s.envVar.trim(),
				value: s.value,
				...(s.allowHosts.trim()
					? { allowHosts: s.allowHosts.split(',').map((x) => x.trim()).filter(Boolean) }
					: {}),
				...(s.allowHostPatterns.trim()
					? {
							allowHostPatterns: s.allowHostPatterns
								.split(',')
								.map((x) => x.trim())
								.filter(Boolean)
						}
					: {}),
				...(s.placeholder.trim() ? { placeholder: s.placeholder.trim() } : {}),
				...(s.requireTls === 'true' || s.requireTls === 'false'
					? { requireTls: s.requireTls === 'true' }
					: {}),
				...(s.onViolation.trim() ? { onViolation: s.onViolation.trim() } : {})
			}));
		if (secrets.length) payload.secrets = secrets;

		if (patchesJson.trim()) {
			try {
				const p = JSON.parse(patchesJson) as unknown;
				if (!Array.isArray(p)) throw new Error('Patches must be a JSON array');
				if (p.length) payload.patches = p as import('microsandbox').PatchConfig[];
			} catch (e) {
				throw new Error(e instanceof Error ? e.message : 'Invalid patches JSON');
			}
		}

		return payload;
	}

	const payloadJson = $derived.by(() => {
		try {
			return JSON.stringify(buildPayload());
		} catch {
			return '';
		}
	});

	const previewJson = $derived.by(() => {
		try {
			return JSON.stringify(buildPayload(), null, 2);
		} catch (e) {
			return e instanceof Error ? e.message : 'Invalid payload';
		}
	});
</script>

<svelte:head>
	<title>New Sandbox | Microsandbox Web UI</title>
</svelte:head>

<SdkUrlFeedback />

<h1>Create sandbox</h1>
<p>
	<a href="/sandboxes">Back to sandboxes</a>
	· Uses <code>microsandbox</code> on the server host (Linux/macOS Apple Silicon). See
	<a href="/settings/sdk">SDK diagnostics</a>.
</p>

{#if createSandbox.fields.allIssues()?.length}
	<ul role="alert">
		{#each createSandbox.fields.allIssues() ?? [] as issue}
			<li>{issue.message}</li>
		{/each}
	</ul>
{/if}

<form {...createSandbox}>
	<input type="hidden" name="payload" value={payloadJson} />

	<fieldset>
		<legend>Identity</legend>
		<label>
			Name <span>*</span>
			<input type="text" bind:value={name} required autocomplete="off" />
		</label>
		<label>
			Image (OCI ref or path) <span>*</span>
			<input type="text" bind:value={image} required placeholder="e.g. python:3.12" />
		</label>
		<label>
			<input type="checkbox" bind:checked={detached} /> Detached (survives server process)
		</label>
		<label>
			<input type="checkbox" bind:checked={replace} /> Replace existing same name
		</label>
	</fieldset>

	<fieldset>
		<legend>Compute</legend>
		<label>CPUs <input type="number" min="1" bind:value={cpus} placeholder="1" /></label>
		<label>Memory (MiB) <input type="number" min="64" bind:value={memoryMib} placeholder="512" /></label>
		<label>Workdir <input type="text" bind:value={workdir} placeholder="/app" /></label>
		<label>Shell <input type="text" bind:value={shell} placeholder="/bin/sh" /></label>
		<label>Hostname <input type="text" bind:value={hostname} /></label>
		<label>User <input type="text" bind:value={user} /></label>
		<label>Max duration (seconds) <input type="number" min="1" bind:value={maxDurationSecs} /></label>
	</fieldset>

	<fieldset>
		<legend>Entrypoint / command</legend>
		<label>Entrypoint (one arg per line) <textarea bind:value={entrypointText} rows="3"></textarea></label>
		<label>Cmd (one arg per line) <textarea bind:value={cmdText} rows="3"></textarea></label>
	</fieldset>

	<fieldset>
		<legend>Environment</legend>
		{#each envRows as row, i}
			<div>
				<input placeholder="NAME" bind:value={row.key} />
				<input placeholder="value" bind:value={row.value} />
				<button
					type="button"
					onclick={() => {
						envRows = envRows.filter((_, j) => j !== i);
					}}>Remove</button
				>
			</div>
		{/each}
		<button
			type="button"
			onclick={() => {
				envRows = [...envRows, { key: '', value: '' }];
			}}>Add variable</button
		>
	</fieldset>

	<fieldset>
		<legend>Scripts map</legend>
		{#each scriptRows as row, i}
			<div>
				<input placeholder="script name" bind:value={row.key} />
				<input placeholder="script body" bind:value={row.value} />
				<button
					type="button"
					onclick={() => {
						scriptRows = scriptRows.filter((_, j) => j !== i);
					}}>Remove</button
				>
			</div>
		{/each}
		<button
			type="button"
			onclick={() => {
				scriptRows = [...scriptRows, { key: '', value: '' }];
			}}>Add script</button
		>
	</fieldset>

	<fieldset>
		<legend>Labels</legend>
		<p>Optional metadata as name/value pairs. Use <strong>Advanced</strong> to paste raw JSON.</p>
		<StructuredJsonField spec={sandboxLabelsSpec} bind:json={labelsJson} />
	</fieldset>

	<fieldset>
		<legend>Port maps (host → guest TCP)</legend>
		{#each portRows as row, i}
			<div>
				<input placeholder="host port" bind:value={row.key} />
				<input placeholder="guest port" bind:value={row.value} />
				<button
					type="button"
					onclick={() => {
						portRows = portRows.filter((_, j) => j !== i);
					}}>Remove</button
				>
			</div>
		{/each}
		<button
			type="button"
			onclick={() => {
				portRows = [...portRows, { key: '', value: '' }];
			}}>Add mapping</button
		>
	</fieldset>

	<fieldset>
		<legend>Mounts</legend>
		{#each mountRows as m, i}
			<fieldset>
				<legend>Mount</legend>
				<label>Guest path <input bind:value={m.guestPath} placeholder="/data" /></label>
				<label>
					Type
					<select bind:value={m.type}>
						<option value="bind">bind</option>
						<option value="named">named volume</option>
						<option value="tmpfs">tmpfs</option>
					</select>
				</label>
				{#if m.type === 'bind'}
					<label>Host path <input bind:value={m.bindHostPath} /></label>
				{:else if m.type === 'named'}
					<label>Volume name <input bind:value={m.namedVolume} /></label>
				{:else}
					<label>Tmpfs size MiB <input bind:value={m.tmpfsSizeMib} type="number" min="1" /></label>
				{/if}
				<label><input type="checkbox" bind:checked={m.readonly} /> Read-only</label>
				<button
					type="button"
					onclick={() => {
						mountRows = mountRows.filter((_, j) => j !== i);
					}}>Remove mount</button
				>
			</fieldset>
		{/each}
		<button
			type="button"
			onclick={() => {
				mountRows = [
					...mountRows,
					{
						guestPath: '',
						type: 'bind',
						bindHostPath: '',
						namedVolume: '',
						tmpfsSizeMib: '',
						readonly: false
					}
				];
			}}>Add mount</button
		>
	</fieldset>

	<fieldset>
		<legend>Network</legend>
		<label>
			<span>Access preset</span>
			<select bind:value={networkMode}>
				<option value="none">None (offline)</option>
				<option value="publicOnly">Public only (recommended default)</option>
				<option value="allowAll">Allow all</option>
				<option value="custom">Custom policy (rules &amp; DNS)</option>
			</select>
		</label>
		{#if networkMode === 'custom'}
			<p>
				Define firewall-style rules and DNS blocking. Field names match the sandbox SDK. Use
				<strong>Advanced</strong> to paste raw <code>NetworkConfig</code> JSON.
			</p>
			<StructuredJsonField spec={networkCustomSpec} bind:json={networkCustomJson} />
		{/if}
	</fieldset>

	<fieldset>
		<legend>Secrets (<code>Secret.env</code>)</legend>
		{#each secretRows as s, i}
			<fieldset>
				<legend>Secret</legend>
				<label>Env var <input bind:value={s.envVar} placeholder="OPENAI_API_KEY" /></label>
				<label>Value <input type="password" bind:value={s.value} autocomplete="off" /></label>
				<label>Allow hosts (comma) <input bind:value={s.allowHosts} placeholder="api.openai.com" /></label>
				<label>Allow host patterns (comma) <input bind:value={s.allowHostPatterns} placeholder="*.openai.com" /></label>
				<label>Placeholder <input bind:value={s.placeholder} /></label>
				<label>
					requireTls
					<select bind:value={s.requireTls}>
						<option value="true">true</option>
						<option value="false">false</option>
					</select>
				</label>
				<label>onViolation <input bind:value={s.onViolation} placeholder="block | block-and-log | block-and-terminate" /></label>
				<button
					type="button"
					onclick={() => {
						secretRows = secretRows.filter((_, j) => j !== i);
					}}>Remove</button
				>
			</fieldset>
		{/each}
		<button
			type="button"
			onclick={() => {
				secretRows = [
					...secretRows,
					{
						envVar: '',
						value: '',
						allowHosts: '',
						allowHostPatterns: '',
						placeholder: '',
						requireTls: 'true',
						onViolation: ''
					}
				];
			}}>Add secret</button
		>
	</fieldset>

	<fieldset>
		<legend>Registry / pull / logs</legend>
		<label>Pull policy <input bind:value={pullPolicy} placeholder="if-missing | always | never" /></label>
		<label>Log level <input bind:value={logLevel} placeholder="info, debug, …" /></label>
		<label><input type="checkbox" bind:checked={quietLogs} /> Quiet logs</label>
		<label>Stop signal <input bind:value={stopSignal} /></label>
		<label>Registry username <input bind:value={registryUser} autocomplete="off" /></label>
		<label>Registry password <input type="password" bind:value={registryPass} autocomplete="off" /></label>
	</fieldset>

	<fieldset>
		<legend>Rootfs patches</legend>
		<p>
			Changes applied to the guest filesystem before boot. Add one patch per row; use
			<strong>Advanced</strong> to edit the JSON array directly.
		</p>
		<StructuredJsonField spec={patchesArraySpec} bind:json={patchesJson} />
	</fieldset>

	<fieldset>
		<legend>Payload preview</legend>
		<pre>{previewJson}</pre>
	</fieldset>

	<p>
		<button type="submit" disabled={createSandbox.pending > 0}>Create sandbox</button>
	</p>
</form>
