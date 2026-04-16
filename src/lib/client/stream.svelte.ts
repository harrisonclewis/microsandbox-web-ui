export type StreamState<T> =
	| { kind: "connecting" }
	| { kind: "error" }
	| { kind: "ready"; data: T };

export type EventStreamHandle<T> = {
	readonly state: StreamState<T>;
	close: () => void;
};

/** @param resolvedUrl — result of `resolve('/path/...')` so `kit.paths.base` is applied */
export function eventStream<T>(
	resolvedUrl: string,
	callbacks?: { onEnd?: () => void; onError?: () => void },
): EventStreamHandle<T> {
	let state = $state<StreamState<T>>({ kind: "connecting" });
	let closedByUs = false;

	const es = new EventSource(resolvedUrl);

	es.onmessage = (event) => {
		try {
			state = { kind: "ready", data: JSON.parse(event.data) as T };
		} catch {
			// ignore malformed payloads
		}
	};

	es.addEventListener("ended", () => {
		closedByUs = true;
		es.close();
		callbacks?.onEnd?.();
	});

	es.onerror = () => {
		if (closedByUs) {
			return;
		}

		closedByUs = true;
		es.close();
		state = { kind: "error" };
		callbacks?.onError?.();
	};

	return {
		get state() {
			return state;
		},
		close() {
			closedByUs = true;
			es.close();
		},
	};
}
