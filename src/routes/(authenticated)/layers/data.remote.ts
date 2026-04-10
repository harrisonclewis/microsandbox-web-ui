import { query } from '$app/server';
import { asc } from 'drizzle-orm';
import { db, layerTable } from '$lib/server/db';

export const getLayers = query(async () => {
	return db
		.select({
			id: layerTable.id,
			digest: layerTable.digest,
			diffId: layerTable.diffId,
			mediaType: layerTable.mediaType,
			sizeBytes: layerTable.sizeBytes,
			createdAt: layerTable.createdAt
		})
		.from(layerTable)
		.orderBy(asc(layerTable.id));
});
