import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, sandboxMetricTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxMetrics = query(async () => {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const [sandboxRows, metrics] = await Promise.all([
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
			namespace: 'metrics',
			query: db
				.select({
					id: sandboxMetricTable.id,
					cpuPercent: sandboxMetricTable.cpuPercent,
					memoryBytes: sandboxMetricTable.memoryBytes,
					diskReadBytes: sandboxMetricTable.diskReadBytes,
					diskWriteBytes: sandboxMetricTable.diskWriteBytes,
					netRxBytes: sandboxMetricTable.netRxBytes,
					netTxBytes: sandboxMetricTable.netTxBytes,
					sampledAt: sandboxMetricTable.sampledAt
				})
				.from(sandboxMetricTable)
				.where(eq(sandboxMetricTable.sandboxId, sandboxId)),
			sorts: {
				sampledAt: sandboxMetricTable.sampledAt,
				cpuPercent: sandboxMetricTable.cpuPercent,
				memoryBytes: sandboxMetricTable.memoryBytes,
				diskReadBytes: sandboxMetricTable.diskReadBytes,
				diskWriteBytes: sandboxMetricTable.diskWriteBytes,
				netRxBytes: sandboxMetricTable.netRxBytes,
				netTxBytes: sandboxMetricTable.netTxBytes
			},
			defaultSortBy: 'sampledAt',
			defaultSortDir: 'desc',
			tieBreaker: sandboxMetricTable.id
		})
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		metrics
	};
});
