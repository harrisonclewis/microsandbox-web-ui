import { error } from '@sveltejs/kit';

export function parseIntParam(value: string | undefined, name: string): number {
	if (!value) {
		error(400, `Missing route param: ${name}`);
	}

	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
		error(400, `Invalid route param: ${name}`);
	}

	return parsed;
}
