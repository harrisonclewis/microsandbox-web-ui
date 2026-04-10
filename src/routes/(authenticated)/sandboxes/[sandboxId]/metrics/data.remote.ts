import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, sandboxMetricTable, sandboxTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxMetrics = query(async () => {
	const sandboxId = parseIntParam(getRequestEvent().params.sandboxId, 'sandboxId');

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
		db
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
			.where(eq(sandboxMetricTable.sandboxId, sandboxId))
			.orderBy(desc(sandboxMetricTable.sampledAt), desc(sandboxMetricTable.id))
			.limit(500)
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		metrics
	};
});
