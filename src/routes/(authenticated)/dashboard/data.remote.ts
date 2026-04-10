import { getRequestEvent, query } from '$app/server';
import { count } from 'drizzle-orm';
import { db, imageTable, runTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';

export const getDashboard = query(async () => {
	const event = getRequestEvent();
	const [sandboxCountRow, runCountRow, imageCountRow] = await Promise.all([
		db.select({ value: count() }).from(sandboxTable),
		db.select({ value: count() }).from(runTable),
		db.select({ value: count() }).from(imageTable)
	]);

	const [recentRuns, recentSandboxes] = await Promise.all([
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'runs',
			query: db
				.select({
					id: runTable.id,
					sandboxId: runTable.sandboxId,
					status: runTable.status,
					exitCode: runTable.exitCode,
					terminationReason: runTable.terminationReason,
					startedAt: runTable.startedAt,
					terminatedAt: runTable.terminatedAt
				})
				.from(runTable),
			sorts: {
				id: runTable.id,
				sandboxId: runTable.sandboxId,
				status: runTable.status,
				exitCode: runTable.exitCode,
				terminationReason: runTable.terminationReason,
				startedAt: runTable.startedAt,
				terminatedAt: runTable.terminatedAt
			},
			defaultSortBy: 'startedAt',
			defaultSortDir: 'desc',
			tieBreaker: runTable.id
		}),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'sandboxes',
			query: db
				.select({
					id: sandboxTable.id,
					name: sandboxTable.name,
					status: sandboxTable.status,
					updatedAt: sandboxTable.updatedAt
				})
				.from(sandboxTable),
			sorts: {
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status,
				updatedAt: sandboxTable.updatedAt
			},
			defaultSortBy: 'updatedAt',
			defaultSortDir: 'desc',
			tieBreaker: sandboxTable.id
		})
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
