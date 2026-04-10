import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, imageTable, sandboxImageTable, sandboxTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getSandboxImages = query(async () => {
	const event = getRequestEvent();
	const sandboxId = parseIntParam(event.params.sandboxId, 'sandboxId');
	const [sandboxRows, images] = await Promise.all([
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
			namespace: 'images',
			query: db
				.select({
					id: sandboxImageTable.id,
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
		})
	]);

	return {
		sandbox: sandboxRows[0] ?? null,
		images
	};
});
