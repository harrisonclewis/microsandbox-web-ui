import { query } from '$app/server';
import { count, desc } from 'drizzle-orm';
import { db, imageTable, runTable, sandboxTable } from '$lib/server/db';

export const getDashboard = query(async () => {
	const [sandboxCountRow, runCountRow, imageCountRow, recentRuns, recentSandboxes] = await Promise.all([
		db.select({ value: count() }).from(sandboxTable),
		db.select({ value: count() }).from(runTable),
		db.select({ value: count() }).from(imageTable),
		db.select({
			id: runTable.id,
			sandboxId: runTable.sandboxId,
			status: runTable.status,
			exitCode: runTable.exitCode,
			terminationReason: runTable.terminationReason,
			startedAt: runTable.startedAt,
			terminatedAt: runTable.terminatedAt
		})
			.from(runTable)
			.orderBy(desc(runTable.startedAt), desc(runTable.id))
			.limit(10),
		db.select({
			id: sandboxTable.id,
			name: sandboxTable.name,
			status: sandboxTable.status,
			updatedAt: sandboxTable.updatedAt
		})
			.from(sandboxTable)
			.orderBy(desc(sandboxTable.updatedAt), desc(sandboxTable.id))
			.limit(10)
	]);

	return {
		counts: {
			sandboxes: sandboxCountRow[0]?.value ?? 0,
			runs: runCountRow[0]?.value ?? 0,
			images: imageCountRow[0]?.value ?? 0
		},
		recentRuns,
		recentSandboxes
	};
});
