import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, imageTable, indexTable, manifestTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getImageDetail = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const [imageRows, indexes, manifests] = await Promise.all([
		db
			.select({
				id: imageTable.id,
				reference: imageTable.reference,
				sizeBytes: imageTable.sizeBytes,
				lastUsedAt: imageTable.lastUsedAt,
				createdAt: imageTable.createdAt
			})
			.from(imageTable)
			.where(eq(imageTable.id, imageId))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'indexes',
			query: db
				.select({
				id: indexTable.id,
				schemaVersion: indexTable.schemaVersion,
				mediaType: indexTable.mediaType,
				platformOs: indexTable.platformOs,
				platformArch: indexTable.platformArch,
				platformVariant: indexTable.platformVariant,
				createdAt: indexTable.createdAt
			})
				.from(indexTable)
				.where(eq(indexTable.imageId, imageId)),
			sorts: {
				id: indexTable.id,
				mediaType: indexTable.mediaType,
				schemaVersion: indexTable.schemaVersion,
				platformOs: indexTable.platformOs,
				platformArch: indexTable.platformArch,
				platformVariant: indexTable.platformVariant,
				createdAt: indexTable.createdAt
			},
			defaultSortBy: 'createdAt',
			defaultSortDir: 'desc',
			tieBreaker: indexTable.id
		}),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'manifests',
			query: db.select({
				id: manifestTable.id,
				digest: manifestTable.digest,
				schemaVersion: manifestTable.schemaVersion,
				mediaType: manifestTable.mediaType,
				createdAt: manifestTable.createdAt
			})
			.from(manifestTable)
			.where(eq(manifestTable.imageId, imageId)),
			sorts: {
				id: manifestTable.id,
				digest: manifestTable.digest,
				mediaType: manifestTable.mediaType,
				schemaVersion: manifestTable.schemaVersion,
				createdAt: manifestTable.createdAt
			},
			defaultSortBy: 'createdAt',
			defaultSortDir: 'desc',
			tieBreaker: manifestTable.id
		})
	]);

	return {
		image: imageRows[0] ?? null,
		indexes,
		manifests
	};
});
