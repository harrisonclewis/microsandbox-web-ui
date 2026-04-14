<script lang="ts">
	import { page } from '$app/state';
	import SdkUrlFeedback from '$lib/components/sdk/SdkUrlFeedback.svelte';
	import { getSandboxFileContext } from './data.remote';
	import {
		fsCopy,
		fsCopyFromHost,
		fsCopyToHost,
		fsExists,
		fsList,
		fsMkdir,
		fsReadText,
		fsRemove,
		fsRemoveDir,
		fsRename,
		fsStat,
		fsWrite
	} from './actions.remote';

	const ctx = getSandboxFileContext();

	let browsePath = $state('/');
	let readWritePath = $state('/');
	let mkdirPath = $state('/');
	let deletePath = $state('/');
	let fromPath = $state('');
	let toPath = $state('');
	let hostPath = $state('');
	let guestPath = $state('');
	let writeContent = $state('');

	const streamSession = $derived(page.url.searchParams.get('streamSession'));

	$effect(() => {
		const p = page.url.searchParams.get('path');
		if (p) {
			browsePath = p;
			readWritePath = p;
			mkdirPath = p;
			deletePath = p;
		}
	});

	const sbName = $derived(ctx.current?.sandboxName ?? '');
</script>

<svelte:head>
	<title>Sandbox files | Microsandbox Web UI</title>
</svelte:head>

<SdkUrlFeedback />

<h1>Guest filesystem</h1>

{#if ctx.error}
	<p>Unable to load context.</p>
{:else if ctx.loading}
	<p>Loading…</p>
{:else if !ctx.current}
	<p>Missing sandbox.</p>
{:else}
	<p>
		<a href={`/sandboxes/${page.params.sandboxId}`}>Back to sandbox</a>
		· Sandbox <code>{sbName}</code>
	</p>

	{#if streamSession}
		<p>Stream session from runs: <code>{streamSession}</code> (open Runs page to control)</p>
	{/if}

	<fieldset>
		<legend>Browse</legend>
		<p>
			Guest path to list, stat, or test for existence (e.g. <code>/</code>, <code>/tmp</code>, <code>/app</code>).
			<code>?path=</code> in the URL pre-fills all path fields on this page.
		</p>
		<label>Path <input bind:value={browsePath} placeholder="/" /></label>
		<form {...fsList}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={browsePath} />
			<button type="submit" disabled={fsList.pending > 0}>List directory</button>
		</form>
		<form {...fsStat}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={browsePath} />
			<button type="submit" disabled={fsStat.pending > 0}>Stat path</button>
		</form>
		<form {...fsExists}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={browsePath} />
			<button type="submit" disabled={fsExists.pending > 0}>Exists?</button>
		</form>
	</fieldset>

	<fieldset>
		<legend>Read / write</legend>
		<p>File path inside the guest. Read and write use this path only—not the browse path above.</p>
		<label>File path <input bind:value={readWritePath} placeholder="/app/readme.txt" /></label>
		<form {...fsReadText}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={readWritePath} />
			<button type="submit" disabled={fsReadText.pending > 0}>Read as UTF-8 text</button>
		</form>
		<form {...fsWrite}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={readWritePath} />
			<label>Content <textarea name="content" bind:value={writeContent} rows="6"></textarea></label>
			<button type="submit" disabled={fsWrite.pending > 0}>Write file</button>
		</form>
	</fieldset>

	<fieldset>
		<legend>Create directory</legend>
		<p>Creates the directory at this guest path.</p>
		<label>Directory path <input bind:value={mkdirPath} placeholder="/app/new-dir" /></label>
		<form {...fsMkdir}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={mkdirPath} />
			<button type="submit" disabled={fsMkdir.pending > 0}>Mkdir</button>
		</form>
	</fieldset>

	<fieldset>
		<legend>Rename / copy on guest</legend>
		<p>Two explicit paths: source and destination inside the guest. Unrelated to browse or delete paths.</p>
		<label>From (source) <input bind:value={fromPath} placeholder="/guest/from" /></label>
		<label>To (destination) <input bind:value={toPath} placeholder="/guest/to" /></label>
		<form {...fsRename}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="from" value={fromPath} />
			<input type="hidden" name="to" value={toPath} />
			<button type="submit" disabled={fsRename.pending > 0}>Rename / move</button>
		</form>
		<form {...fsCopy}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="from" value={fromPath} />
			<input type="hidden" name="to" value={toPath} />
			<button type="submit" disabled={fsCopy.pending > 0}>Copy (guest)</button>
		</form>
	</fieldset>

	<fieldset>
		<legend>Delete file or directory</legend>
		<p>Path to remove. Choose delete file or delete directory; unrelated to rename/copy paths.</p>
		<label>Path to delete <input bind:value={deletePath} placeholder="/guest/target" /></label>
		<form {...fsRemove}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={deletePath} />
			<button type="submit" disabled={fsRemove.pending > 0}>Delete file</button>
		</form>
		<form {...fsRemoveDir}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="path" value={deletePath} />
			<button type="submit" disabled={fsRemoveDir.pending > 0}>Delete directory</button>
		</form>
	</fieldset>

	<fieldset>
		<legend>Host ↔ guest copy</legend>
		<label>Host path <input bind:value={hostPath} placeholder="/host/path" /></label>
		<label>Guest path <input bind:value={guestPath} placeholder="/guest/path" /></label>
		<form {...fsCopyFromHost}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="hostPath" value={hostPath} />
			<input type="hidden" name="guestPath" value={guestPath} />
			<button type="submit" disabled={fsCopyFromHost.pending > 0}>Copy host → guest</button>
		</form>
		<form {...fsCopyToHost}>
			<input type="hidden" name="sandboxName" value={sbName} />
			<input type="hidden" name="guestPath" value={guestPath} />
			<input type="hidden" name="hostPath" value={hostPath} />
			<button type="submit" disabled={fsCopyToHost.pending > 0}>Copy guest → host</button>
		</form>
	</fieldset>
{/if}
