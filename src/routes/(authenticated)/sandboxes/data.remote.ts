import { query } from '$app/server';
import { asc } from 'drizzle-orm';
import { db, sandboxTable } from '$lib/server/db';

export const getSandboxes = query(async () => {
	return db
		.select({
			id: sandboxTable.id,
			name: sandboxTable.name,
			status: sandboxTable.status,
			createdAt: sandboxTable.createdAt,
			updatedAt: sandboxTable.updatedAt
		})
		.from(sandboxTable)
		.orderBy(asc(sandboxTable.name), asc(sandboxTable.id));
});
