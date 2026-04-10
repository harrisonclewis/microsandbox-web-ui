import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, sandboxTable, snapshotTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getSnapshots = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'snapshots',
		query: db
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
			.leftJoin(sandboxTable, eq(sandboxTable.id, snapshotTable.sandboxId)),
		sorts: {
			name: snapshotTable.name,
			sandboxName: sandboxTable.name,
			sizeBytes: snapshotTable.sizeBytes,
			createdAt: snapshotTable.createdAt
		},
		defaultSortBy: 'createdAt',
		defaultSortDir: 'desc',
		tieBreaker: snapshotTable.id
	});
});
