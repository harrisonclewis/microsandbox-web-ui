import { getRequestEvent } from '$app/server';
import { error, invalid } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, sandboxTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export async function getSandboxNameFromRouteParam(): Promise<string> {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const rows = await db
		.select({ name: sandboxTable.name })
		.from(sandboxTable)
		.where(eq(sandboxTable.id, sandboxId))
		.limit(1);
	const row = rows[0];
	if (!row) error(404, 'Sandbox not found');
	return row.name;
}

export function assertSandboxNameMatches(formName: string, routeName: string): void {
	if (formName !== routeName) {
		invalid('Sandbox name does not match this page.');
	}
}
