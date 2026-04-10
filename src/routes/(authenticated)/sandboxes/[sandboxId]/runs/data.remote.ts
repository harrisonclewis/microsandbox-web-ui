import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, runTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxRuns = query(async () => {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const [sandboxRows, runs] = await Promise.all([
		db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status
			})
			.from(sandboxTable)
			.where(eq(sandboxTable.id, sandboxId))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'runs',
			query: db
				.select({
					id: runTable.id,
					pid: runTable.pid,
					status: runTable.status,
					exitCode: runTable.exitCode,
					exitSignal: runTable.exitSignal,
					terminationReason: runTable.terminationReason,
					startedAt: runTable.startedAt,
					terminatedAt: runTable.terminatedAt
				})
				.from(runTable)
				.where(eq(runTable.sandboxId, sandboxId)),
			sorts: {
				id: runTable.id,
				pid: runTable.pid,
				status: runTable.status,
				exitCode: runTable.exitCode,
				exitSignal: runTable.exitSignal,
				terminationReason: runTable.terminationReason,
				startedAt: runTable.startedAt,
				terminatedAt: runTable.terminatedAt
			},
			defaultSortBy: 'startedAt',
			defaultSortDir: 'desc',
			tieBreaker: runTable.id
		})
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		runs
	};
});
