<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import RemoteState from "$lib/components/remote-state.svelte";
	import { SandboxStatus } from "$lib/types";
	import { getSandbox } from "../data.remote";

	const sandboxName = $derived(page.params.name!);
	const sandbox = $derived(getSandbox(sandboxName));

	let command = $state("");
	let liveOut = $state("");
	let liveErr = $state("");
	let executionError = $state<string | null>(null);
	let running = $state(false);
	let lastExitCode = $state<number | null>(null);
	let lastDurationMs = $state<number | null>(null);

	type NdJson =
		| { type: "chunk"; stream: "stdout" | "stderr"; text: string }
		| { type: "done"; code: number; durationMs: number }
		| { type: "fault"; message: string };

	async function submitCommand(): Promise<void> {
		const text = command.trim();

		if (text.length === 0) {
			return;
		}

		executionError = null;
		liveOut = "";
		liveErr = "";
		lastExitCode = null;
		lastDurationMs = null;
		running = true;

		const url = resolve(`/sandbox/${encodeURIComponent(sandboxName)}/execution/run-stream`);

		let response: Response;

		try {
			response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ command: text }),
			});
		} catch (e) {
			running = false;
			executionError = e instanceof Error ? e.message : "Request failed.";
			return;
		}

		if (!response.ok) {
			running = false;

			try {
				const j = (await response.json()) as { message?: string };

				if (typeof j.message === "string") {
					executionError = j.message;
				} else {
					executionError = `Request failed (${response.status}).`;
				}
			} catch {
				executionError = `Request failed (${response.status}).`;
			}

			return;
		}

		const reader = response.body?.getReader();

		if (!reader) {
			running = false;
			executionError = "No response stream.";
			return;
		}

		const decoder = new TextDecoder();
		let buffer = "";

		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const rawLine of lines) {
					const line = rawLine.trim();

					if (line.length === 0) {
						continue;
					}

					let msg: NdJson;

					try {
						msg = JSON.parse(line) as NdJson;
					} catch {
						executionError = "Malformed stream from server.";
						continue;
					}

					if (msg.type === "chunk") {
						if (msg.stream === "stdout") {
							liveOut += msg.text;
						} else {
							liveErr += msg.text;
						}
					} else if (msg.type === "done") {
						lastExitCode = msg.code;
						lastDurationMs = msg.durationMs;
					} else if (msg.type === "fault") {
						executionError = msg.message;
					}
				}
			}

			const tail = buffer.trim();

			if (tail.length > 0) {
				try {
					const msg = JSON.parse(tail) as NdJson;

					if (msg.type === "done") {
						lastExitCode = msg.code;
						lastDurationMs = msg.durationMs;
					} else if (msg.type === "fault") {
						executionError = msg.message;
					}
				} catch {
					// ignore incomplete
				}
			}
		} finally {
			running = false;
		}
	}

	function onFormSubmit(event: SubmitEvent): void {
		event.preventDefault();
		void submitCommand();
	}
</script>

<style>
	textarea {
		display: block;
		width: 100%;
	}
</style>

<h2>Execution</h2>

<RemoteState remote={sandbox}>
	{#snippet children(remote)}
		{#if remote.current?.data}
			{#if remote.current.data.status !== SandboxStatus.Running}
				<p>Start the sandbox to run a command.</p>
			{:else}
				<section>
					{#if (executionError || liveOut.length > 0 || liveErr.length > 0 || lastExitCode !== null && lastDurationMs !== null)}
						<fieldset>
							<legend>Output</legend>
							
							{#if executionError}
								<p role="alert">{executionError}</p>
							{/if}

							{#if liveOut.length > 0 || liveErr.length > 0}
								<pre>{liveOut}{liveErr}</pre>
							{/if}

							{#if lastExitCode !== null && lastDurationMs !== null}
								<p>
									Exit code: {lastExitCode}. Server time: {lastDurationMs} ms.
								</p>
							{/if}
						</fieldset>
					{/if}

					<form onsubmit={onFormSubmit}>
						<fieldset>
							<legend>Run Command</legend>

							<textarea
								name="command"
								rows="6"
								autocomplete="off"
								spellcheck="false"
								disabled={running}
								bind:value={command}
							></textarea>

							<button type="submit" disabled={running}>
								Send
							</button>
						</fieldset>
					</form>
				</section>
			{/if}
		{:else}
			<p>Sandbox not found.</p>
		{/if}
	{/snippet}
</RemoteState>
