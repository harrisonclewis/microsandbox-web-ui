import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, imageTable, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getImageManifests = query(async () => {
	const imageId = parseIntParam(getRequestEvent().params.imageId, 'imageId');

	const [imageRows, manifests] = await Promise.all([
		db
			.select({
				id: imageTable.id,
				reference: imageTable.reference
			})
			.from(imageTable)
			.where(eq(imageTable.id, imageId))
			.limit(1),
		db
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
			.where(eq(manifestTable.imageId, imageId))
			.orderBy(desc(manifestTable.createdAt), desc(manifestTable.id))
	]);

	return {
		image: imageRows[0] ?? null,
		manifests
	};
});
