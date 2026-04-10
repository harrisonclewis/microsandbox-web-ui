type Entry = {
	attempts: number[];
};

export class RateLimiter {
	private readonly store = new Map<string, Entry>();
	private lastCleanup = Date.now();

	constructor(
		private readonly maxAttempts: number,
		private readonly windowMs: number
	) {}

	isLimited(key: string): boolean {
		this.evictExpiredAttempts(key);
		const entry = this.store.get(key);

		return !!entry && entry.attempts.length >= this.maxAttempts;
	}

	hit(key: string): void {
		this.sweep();
		this.evictExpiredAttempts(key);

		const entry = this.store.get(key);

		if (entry) {
			entry.attempts.push(Date.now());
			return;
		}

		this.store.set(key, {
			attempts: [Date.now()]
		});
	}

	private evictExpiredAttempts(key: string): void {
		const entry = this.store.get(key);
		if (!entry) {
			return;
		}

		this.pruneExpiredAttempts(entry, Date.now());

		if (entry.attempts.length === 0) {
			this.store.delete(key);
		}
	}

	private sweep(): void {
		const now = Date.now();
		const shouldCleanup = now - this.lastCleanup >= this.windowMs;

		if (!shouldCleanup) {
			return;
		}

		this.lastCleanup = now;
		
		for (const [key, entry] of this.store) {
			this.pruneExpiredAttempts(entry, now);
			if (entry.attempts.length === 0) this.store.delete(key);
		}
	}

	private pruneExpiredAttempts(entry: Entry, now: number): void {
		const cutoff = now - this.windowMs;
		let keepFromIndex = 0;

		while (keepFromIndex < entry.attempts.length && entry.attempts[keepFromIndex] <= cutoff) {
			keepFromIndex++;
		}

		if (keepFromIndex > 0) {
			entry.attempts.splice(0, keepFromIndex);
		}
	}
}
