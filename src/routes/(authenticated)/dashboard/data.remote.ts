import { getRequestEvent, query } from '$app/server';
import { count } from 'drizzle-orm';
import { db, imageTable, runTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { DbJson } from '$lib/validation/db-json';
import { sandboxEngineConfigSchema } from '$lib/sandbox/engine-config';
import { getSdkCapabilities } from '$lib/server/microsandbox/guards.js';
import { sdkAllMetrics } from '$lib/server/microsandbox/service.js';

/** Point-in-time metrics for all running sandboxes (SDK); null when SDK unavailable. */
export const getLiveSdkMetrics = query(async () => {
	const capabilities = getSdkCapabilities();
	if (!capabilities.supportedHost || !capabilities.installed) {
		return { capabilities, metrics: null };
	}
	const metrics = await sdkAllMetrics();
	return { capabilities, metrics };
});

export const getDashboardStats = query(async () => {
	const [sandboxCountRow, runCountRow, imageCountRow] = await Promise.all([
		db.select({ value: count() }).from(sandboxTable),
		db.select({ value: count() }).from(runTable),
		db.select({ value: count() }).from(imageTable)
	]);

	return {
		sandboxes: sandboxCountRow[0]?.value ?? 0,
		runs: runCountRow[0]?.value ?? 0,
		images: imageCountRow[0]?.value ?? 0
	};
});

export const getDashboardRecentRuns = query(async () => {
	const event = getRequestEvent();
	return Pagination.fromSearchParams(event.url.searchParams, {
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
	});
});

export const getDashboardRecentSandboxes = query(async () => {
	const event = getRequestEvent();

	const pagination = await Pagination.fromSearchParams(event.url.searchParams, {
		namespace: 'sandboxes',
		query: db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				status: sandboxTable.status,
				updatedAt: sandboxTable.updatedAt,
				config: sandboxTable.config
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
	});

	return {
		...pagination,
		data: pagination.data.map(sandbox => ({
			...sandbox,
			config: DbJson.column(sandboxEngineConfigSchema, sandbox.config)
		}))
	};
});
