import { getRequestEvent, query } from '$app/server';
import { and, eq } from 'drizzle-orm';
import { db, runTable, sandboxTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getRunDetail = query(async () => {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const runId = parseIntParam(event.params.runId, 'runId');

	const rows = await db
		.select({
			id: runTable.id,
			sandboxId: runTable.sandboxId,
			sandboxName: sandboxTable.name,
			pid: runTable.pid,
			status: runTable.status,
			exitCode: runTable.exitCode,
			exitSignal: runTable.exitSignal,
			terminationReason: runTable.terminationReason,
			terminationDetail: runTable.terminationDetail,
			signalsSent: runTable.signalsSent,
			startedAt: runTable.startedAt,
			terminatedAt: runTable.terminatedAt
		})
		.from(runTable)
		.innerJoin(sandboxTable, eq(sandboxTable.id, runTable.sandboxId))
		.where(and(eq(runTable.id, runId), eq(runTable.sandboxId, sandboxId)))
		.limit(1);

	return rows[0] ?? null;
});
