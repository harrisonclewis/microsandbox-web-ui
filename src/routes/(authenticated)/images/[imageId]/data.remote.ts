import { getRequestEvent, query } from '$app/server';
import { desc, eq } from 'drizzle-orm';
import { db, imageTable, indexTable, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getImageDetail = query(async () => {
	const imageId = parseIntParam(getRequestEvent().params.imageId, 'imageId');

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
		db
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
			.where(eq(indexTable.imageId, imageId))
			.orderBy(desc(indexTable.createdAt), desc(indexTable.id)),
		db
			.select({
				id: manifestTable.id,
				digest: manifestTable.digest,
				schemaVersion: manifestTable.schemaVersion,
				mediaType: manifestTable.mediaType,
				createdAt: manifestTable.createdAt
			})
			.from(manifestTable)
			.where(eq(manifestTable.imageId, imageId))
			.orderBy(desc(manifestTable.createdAt), desc(manifestTable.id))
	]);

	return {
		image: imageRows[0] ?? null,
		indexes,
		manifests
	};
});
