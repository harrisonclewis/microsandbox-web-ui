import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, sandboxTable, snapshotTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getSnapshotDetail = query(async () => {
	const snapshotId = parseIntParam(getRequestEvent().params.snapshotId, 'snapshotId');

	const rows = await db
		.select({
			id: snapshotTable.id,
			name: snapshotTable.name,
			sandboxId: snapshotTable.sandboxId,
			sandboxName: sandboxTable.name,
			description: snapshotTable.description,
			sizeBytes: snapshotTable.sizeBytes,
			createdAt: snapshotTable.createdAt
		})
		.from(snapshotTable)
		.leftJoin(sandboxTable, eq(sandboxTable.id, snapshotTable.sandboxId))
		.where(eq(snapshotTable.id, snapshotId))
		.limit(1);

	return rows[0] ?? null;
});
