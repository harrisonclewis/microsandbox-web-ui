import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, imageTable, manifestTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getImageManifests = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const [imageRows, manifests] = await Promise.all([
		db
			.select({
				id: imageTable.id,
				reference: imageTable.reference
			})
			.from(imageTable)
			.where(eq(imageTable.id, imageId))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'manifests',
			query: db
				.select({
					id: manifestTable.id,
					indexId: manifestTable.indexId,
					digest: manifestTable.digest,
					schemaVersion: manifestTable.schemaVersion,
					mediaType: manifestTable.mediaType,
					annotations: manifestTable.annotations,
					createdAt: manifestTable.createdAt
				})
				.from(manifestTable)
				.where(eq(manifestTable.imageId, imageId)),
			sorts: {
				id: manifestTable.id,
				digest: manifestTable.digest,
				mediaType: manifestTable.mediaType,
				schemaVersion: manifestTable.schemaVersion,
				indexId: manifestTable.indexId,
				createdAt: manifestTable.createdAt
			},
			defaultSortBy: 'createdAt',
			defaultSortDir: 'desc',
			tieBreaker: manifestTable.id
		})
	]);

	return {
		image: imageRows[0] ?? null,
		manifests
	};
});
