/** Remove empty strings, empty objects/arrays, and undefined for cleaner JSON payloads. */
export function omitEmptyDeep(value: unknown): unknown {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === 'string') {
		return value.trim() === '' ? undefined : value;
	}
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : undefined;
	}
	if (typeof value === 'boolean') return value;
	if (Array.isArray(value)) {
		const mapped = value.map((x) => omitEmptyDeep(x)).filter((x) => x !== undefined);
		return mapped.length === 0 ? undefined : mapped;
	}
	if (typeof value === 'object') {
		const o = value as Record<string, unknown>;
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(o)) {
			const next = omitEmptyDeep(v);
			if (next !== undefined) out[k] = next;
		}
		return Object.keys(out).length === 0 ? undefined : out;
	}
	return value;
}
