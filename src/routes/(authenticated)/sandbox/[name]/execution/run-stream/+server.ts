import { normalizeSandboxName } from "$lib/server/sandbox-name";
import { msb } from "$lib/server/microsandbox";
import type { Sandbox, SandboxHandle } from "microsandbox";
import type { RequestHandler } from "./$types";

type NdJsonLine =
	| { type: "chunk"; stream: "stdout" | "stderr"; text: string }
	| { type: "done"; code: number; durationMs: number }
	| { type: "fault"; message: string };

function ndjson(line: NdJsonLine): Uint8Array {
	return new TextEncoder().encode(`${JSON.stringify(line)}\n`);
}

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ message }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

export const POST: RequestHandler = async ({ params, request }) => {
	let name: string;

	try {
		name = normalizeSandboxName(params.name ?? "");
	} catch {
		return jsonError("Invalid sandbox name.", 400);
	}

	let body: { command?: unknown };

	try {
		body = (await request.json()) as { command?: unknown };
	} catch {
		return jsonError("Expected JSON body.", 400);
	}

	const commandRaw = typeof body.command === "string" ? body.command : "";
	const command = commandRaw.trim();

	if (!command) {
		return jsonError("Command is empty.", 400);
	}

	if (command.length > 65536) {
		return jsonError("Command is too long.", 400);
	}

	try {
		msb();
	} catch {
		return jsonError("Microsandbox is not available on this host.", 503);
	}

	let handle: SandboxHandle | null = null;

	try {
		handle = await msb().Sandbox.get(name);
	} catch {
		return jsonError("Sandbox not found.", 404);
	}

	if (!handle || handle.status !== "running") {
		return jsonError("Sandbox is not running.", 404);
	}

	const sandboxHandle = handle;

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			let live: Sandbox | null = null;

			try {
				live = await sandboxHandle.connect();
				const t0 = Date.now();
				const execHandle = await live.shellStream(command);
				let exitCode = 1;

				while (true) {
					let ev;

					try {
						ev = await execHandle.recv();
					} catch (e) {
						const message = e instanceof Error ? e.message : String(e);
						controller.enqueue(ndjson({ type: "fault", message }));
						controller.close();
						return;
					}

					if (ev === null) {
						break;
					}

					if (ev.eventType === "stdout" && ev.data) {
						const text = ev.data.toString("utf8");
						controller.enqueue(ndjson({ type: "chunk", stream: "stdout", text }));
					} else if (ev.eventType === "stderr" && ev.data) {
						const text = ev.data.toString("utf8");
						controller.enqueue(ndjson({ type: "chunk", stream: "stderr", text }));
					} else if (ev.eventType === "exited") {
						exitCode = typeof ev.code === "number" ? ev.code : 1;
					}
				}

				const durationMs = Date.now() - t0;

				controller.enqueue(ndjson({ type: "done", code: exitCode, durationMs }));
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e);
				controller.enqueue(ndjson({ type: "fault", message: `Command failed: ${message}` }));
			} finally {
				if (live) {
					try {
						await live.detach();
					} catch {
						// best-effort
					}
				}

				try {
					controller.close();
				} catch {
					// ignore
				}
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "application/x-ndjson; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
};
