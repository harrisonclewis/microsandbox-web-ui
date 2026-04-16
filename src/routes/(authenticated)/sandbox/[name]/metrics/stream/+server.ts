import { msb } from "$lib/server/microsandbox";
import type { Sandbox, SandboxHandle } from "microsandbox";
import type { RequestHandler } from "./$types";

const METRICS_INTERVAL_MS = 2000;

function normalizeName(raw: string | undefined): string {
	const normalized = (raw ?? "").trim();

	if (!normalized) {
		throw new Error("Invalid sandbox name");
	}

	return normalized;
}

export const GET: RequestHandler = async ({ params, request }) => {
	let name: string;

	try {
		name = normalizeName(params.name);
	} catch {
		return new Response("Invalid sandbox name", { status: 400 });
	}

	try {
		msb();
	} catch {
		return new Response("Microsandbox unavailable on this host", { status: 503 });
	}

	let handle: SandboxHandle | null = null;

	try {
		handle = await msb().Sandbox.get(name);
	} catch {
		return new Response("Not found", { status: 404 });
	}

	if (!handle || handle.status !== "running") {
		return new Response("Not found", { status: 404 });
	}

	let live: Sandbox;

	try {
		live = await handle.connect();
	} catch {
		return new Response("Unable to connect to sandbox", { status: 503 });
	}

	const signal = request.signal;
	const encoder = new TextEncoder();
	let detached = false;

	async function detachOnce(sandbox: Sandbox): Promise<void> {
		if (detached) {
			return;
		}

		detached = true;

		try {
			await sandbox.detach();
		} catch {
			// best-effort
		}
	}

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const onAbort = (): void => {
				void detachOnce(live);
			};

			signal.addEventListener("abort", onAbort);

			try {
				const metricsStream = await live.metricsStream(METRICS_INTERVAL_MS);

				for await (const snapshot of metricsStream) {
					if (signal.aborted) {
						break;
					}

					if (snapshot === null) {
						break;
					}

					controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));
				}
			} catch {
				// stream or iterator error — still send ended and detach
			} finally {
				signal.removeEventListener("abort", onAbort);
				await detachOnce(live);

				try {
					controller.enqueue(encoder.encode(`event: ended\ndata: {}\n\n`));
				} catch {
					// stream may already be closed
				}

				try {
					controller.close();
				} catch {
					// ignore
				}
			}
		},
		cancel() {
			void detachOnce(live);
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};
