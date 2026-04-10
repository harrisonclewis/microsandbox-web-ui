import { getRequestEvent, query } from '$app/server';
import { and, eq } from 'drizzle-orm';
import { db, indexTable, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getIndexDetail = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const indexId = parseIntParam(event.params.indexId, 'indexId');

	const [indexRows, manifests] = await Promise.all([
		db
			.select({
				id: indexTable.id,
				imageId: indexTable.imageId,
				schemaVersion: indexTable.schemaVersion,
				mediaType: indexTable.mediaType,
				platformOs: indexTable.platformOs,
				platformArch: indexTable.platformArch,
				platformVariant: indexTable.platformVariant,
				annotations: indexTable.annotations,
				createdAt: indexTable.createdAt
			})
			.from(indexTable)
			.where(and(eq(indexTable.id, indexId), eq(indexTable.imageId, imageId)))
			.limit(1),
		db
			.select({
				id: manifestTable.id,
				digest: manifestTable.digest,
				mediaType: manifestTable.mediaType,
				schemaVersion: manifestTable.schemaVersion,
				createdAt: manifestTable.createdAt
			})
			.from(manifestTable)
			.where(and(eq(manifestTable.indexId, indexId), eq(manifestTable.imageId, imageId)))
	]);

	return {
		index: indexRows[0] ?? null,
		manifests
	};
});
