import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, imageTable, layerTable, manifestLayerTable, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getLayerDetail = query(async () => {
	const layerId = parseIntParam(getRequestEvent().params.layerId, 'layerId');

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
		db
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
			.where(eq(manifestLayerTable.layerId, layerId))
			.orderBy(desc(manifestTable.id), desc(manifestLayerTable.position))
	]);

	return {
		layer: layerRows[0] ?? null,
		usage
	};
});
