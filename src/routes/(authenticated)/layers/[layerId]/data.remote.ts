import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, imageTable, layerTable, manifestLayerTable, manifestTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getLayerDetail = query(async () => {
	const event = getRequestEvent();
	const layerId = parseIntParam(event.params.layerId, 'layerId');
	const [layerRows, usage] = await Promise.all([
		db
			.select({
				id: layerTable.id,
				digest: layerTable.digest,
				diffId: layerTable.diffId,
				mediaType: layerTable.mediaType,
				sizeBytes: layerTable.sizeBytes,
				createdAt: layerTable.createdAt
			})
			.from(layerTable)
			.where(eq(layerTable.id, layerId))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'usage',
			query: db
				.select({
					manifestId: manifestTable.id,
					manifestDigest: manifestTable.digest,
					imageId: imageTable.id,
					imageReference: imageTable.reference,
					position: manifestLayerTable.position
				})
				.from(manifestLayerTable)
				.innerJoin(manifestTable, eq(manifestTable.id, manifestLayerTable.manifestId))
				.innerJoin(imageTable, eq(imageTable.id, manifestTable.imageId))
				.where(eq(manifestLayerTable.layerId, layerId)),
			sorts: {
				imageReference: imageTable.reference,
				manifestDigest: manifestTable.digest,
				position: manifestLayerTable.position
			},
			defaultSortBy: 'position',
			defaultSortDir: 'desc',
			tieBreaker: manifestLayerTable.id
		})
	]);

	return {
		layer: layerRows[0] ?? null,
		usage
	};
});
