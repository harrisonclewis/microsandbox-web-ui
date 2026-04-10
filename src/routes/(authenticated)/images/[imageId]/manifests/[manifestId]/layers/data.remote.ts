import { getRequestEvent, query } from '$app/server';
import { and, eq } from 'drizzle-orm';
import { db, layerTable, manifestLayerTable, manifestTable } from '$lib/server/db';
import { Pagination } from '$lib/server/pagination';
import { parseIntParam } from '$lib/server/route-params';

export const getManifestLayers = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const manifestId = parseIntParam(event.params.manifestId, 'manifestId');
	const [manifestRows, layers] = await Promise.all([
		db
			.select({
				id: manifestTable.id,
				imageId: manifestTable.imageId,
				digest: manifestTable.digest
			})
			.from(manifestTable)
			.where(and(eq(manifestTable.id, manifestId), eq(manifestTable.imageId, imageId)))
			.limit(1),
		Pagination.fromSearchParams(event.url.searchParams, {
			namespace: 'layers',
			query: db
				.select({
					manifestLayerId: manifestLayerTable.id,
					position: manifestLayerTable.position,
					layerId: layerTable.id,
					digest: layerTable.digest,
					diffId: layerTable.diffId,
					mediaType: layerTable.mediaType,
					sizeBytes: layerTable.sizeBytes,
					createdAt: layerTable.createdAt
				})
				.from(manifestLayerTable)
				.innerJoin(layerTable, eq(layerTable.id, manifestLayerTable.layerId))
				.where(eq(manifestLayerTable.manifestId, manifestId)),
			sorts: {
				position: manifestLayerTable.position,
				layerId: layerTable.id,
				digest: layerTable.digest,
				diffId: layerTable.diffId,
				mediaType: layerTable.mediaType,
				sizeBytes: layerTable.sizeBytes,
				createdAt: layerTable.createdAt
			},
			defaultSortBy: 'position',
			defaultSortDir: 'asc',
			tieBreaker: manifestLayerTable.id
		})
	]);

	return {
		manifest: manifestRows[0] ?? null,
		layers
	};
});
