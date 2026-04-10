import { query } from '$app/server';
import { and, desc, eq, or } from 'drizzle-orm';
import { db, runTable, sandboxTable } from '$lib/server/db';

export const getActivity = query(async () => {
	const rows = await db
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
		.where(
			or(
				eq(runTable.status, 'failed'),
				eq(runTable.status, 'terminated'),
				and(eq(runTable.status, 'exited'), eq(runTable.exitCode, 1))
			)
		)
		.orderBy(desc(runTable.startedAt), desc(runTable.id))
		.limit(100);

	return rows;
});
