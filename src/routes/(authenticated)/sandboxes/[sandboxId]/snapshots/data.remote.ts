import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, sandboxTable, snapshotTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxSnapshots = query(async () => {
	const sandboxId = parseIntParam(getRequestEvent().params.sandboxId, 'sandboxId');

	const [sandboxRows, snapshots] = await Promise.all([
		db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status
			})
			.from(sandboxTable)
			.where(eq(sandboxTable.id, sandboxId))
			.limit(1),
		db
			.select({
				id: snapshotTable.id,
				name: snapshotTable.name,
				description: snapshotTable.description,
				sizeBytes: snapshotTable.sizeBytes,
				createdAt: snapshotTable.createdAt
			})
			.from(snapshotTable)
			.where(eq(snapshotTable.sandboxId, sandboxId))
			.orderBy(desc(snapshotTable.createdAt), desc(snapshotTable.id))
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		snapshots
	};
});
