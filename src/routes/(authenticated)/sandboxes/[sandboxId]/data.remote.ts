import { getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import {
	db,
	imageTable,
	runTable,
	sandboxImageTable,
	sandboxTable,
	snapshotTable
} from '$lib/server/db';
import { sandboxEngineConfigSchema } from '$lib/sandbox/engine-config';
import { Pagination } from '$lib/server/pagination';
import { DbJson } from '$lib/validation/db-json';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxDetail = query(async () => {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const [sandboxRows, linkedImages, latestRuns, snapshotRows] = await Promise.all([
		db
			.select({
				id: sandboxTable.id,
				name: sandboxTable.name,
				config: sandboxTable.config,
				status: sandboxTable.status,
				createdAt: sandboxTable.createdAt,
				updatedAt: sandboxTable.updatedAt
			})
			.from(sandboxTable)
			.where(eq(sandboxTable.id, sandboxId))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'images',
			query: db
				.select({
					sandboxImageId: sandboxImageTable.id,
					imageId: imageTable.id,
					imageReference: imageTable.reference,
					manifestDigest: sandboxImageTable.manifestDigest,
					createdAt: sandboxImageTable.createdAt
				})
				.from(sandboxImageTable)
				.innerJoin(imageTable, eq(imageTable.id, sandboxImageTable.imageId))
				.where(eq(sandboxImageTable.sandboxId, sandboxId)),
			sorts: {
				imageReference: imageTable.reference,
				manifestDigest: sandboxImageTable.manifestDigest,
				createdAt: sandboxImageTable.createdAt
			},
			defaultSortBy: 'createdAt',
			defaultSortDir: 'desc',
			tieBreaker: sandboxImageTable.id
		}),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'runs',
			query: db
				.select({
					id: runTable.id,
					status: runTable.status,
					exitCode: runTable.exitCode,
					terminationReason: runTable.terminationReason,
					startedAt: runTable.startedAt,
					terminatedAt: runTable.terminatedAt
				})
				.from(runTable)
				.where(eq(runTable.sandboxId, sandboxId)),
			sorts: {
				id: runTable.id,
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
		db
			.select({
				id: snapshotTable.id,
				name: snapshotTable.name,
				sizeBytes: snapshotTable.sizeBytes,
				createdAt: snapshotTable.createdAt
			})
			.from(snapshotTable)
			.where(eq(snapshotTable.sandboxId, sandboxId))
			.orderBy(desc(snapshotTable.createdAt), desc(snapshotTable.id))
	]);

	const sandbox = sandboxRows[0];

	if (!sandbox) {
		error(404, 'Sandbox not found');
	}

	return {
		sandbox: {
			...sandbox,
			config: DbJson.column(sandboxEngineConfigSchema, sandbox.config)
		},
		linkedImages,
		latestRuns,
		snapshots: snapshotRows
	};
});
