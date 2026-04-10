import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, runTable, sandboxTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxRuns = query(async () => {
	const sandboxId = parseIntParam(getRequestEvent().params.sandboxId, 'sandboxId');

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
		db
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
			.where(eq(runTable.sandboxId, sandboxId))
			.orderBy(desc(runTable.startedAt), desc(runTable.id))
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		runs
	};
});
