import { getRequestEvent, query } from '$app/server';
import { and, eq, or } from 'drizzle-orm';
import { db, runTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getActivity = query(async () => {
	const event = getRequestEvent();
	const filter = or(
		eq(runTable.status, 'failed'),
		eq(runTable.status, 'terminated'),
		and(eq(runTable.status, 'exited'), eq(runTable.exitCode, 1))
	);
	return Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'activity',
		query: db
			.select({
			id: runTable.id,
			sandboxId: runTable.sandboxId,
			sandboxName: sandboxTable.name,
			status: runTable.status,
			exitCode: runTable.exitCode,
			exitSignal: runTable.exitSignal,
			terminationReason: runTable.terminationReason,
			terminationDetail: runTable.terminationDetail,
			startedAt: runTable.startedAt,
			terminatedAt: runTable.terminatedAt
		})
			.from(runTable)
			.innerJoin(sandboxTable, eq(sandboxTable.id, runTable.sandboxId))
			.where(filter),
		sorts: {
			id: runTable.id,
			sandboxName: sandboxTable.name,
			status: runTable.status,
			exitCode: runTable.exitCode,
			exitSignal: runTable.exitSignal,
			terminationReason: runTable.terminationReason,
			terminationDetail: runTable.terminationDetail,
			startedAt: runTable.startedAt,
			terminatedAt: runTable.terminatedAt
		},
		defaultSortBy: 'startedAt',
		defaultSortDir: 'desc',
		tieBreaker: runTable.id
	});
});
