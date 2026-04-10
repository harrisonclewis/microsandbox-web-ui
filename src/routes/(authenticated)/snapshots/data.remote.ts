import { query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, sandboxTable, snapshotTable } from '$lib/server/db';

export const getSnapshots = query(async () => {
	return db
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
		.orderBy(desc(snapshotTable.createdAt), desc(snapshotTable.id));
});
