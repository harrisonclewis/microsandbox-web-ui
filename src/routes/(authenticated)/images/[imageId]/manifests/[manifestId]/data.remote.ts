import { getRequestEvent, query } from '$app/server';
import { and, eq } from 'drizzle-orm';
import { db, manifestTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getManifestDetail = query(async () => {
	const event = getRequestEvent();
	const imageId = parseIntParam(event.params.imageId, 'imageId');
	const manifestId = parseIntParam(event.params.manifestId, 'manifestId');

	const rows = await db
		.select({
			id: manifestTable.id,
			imageId: manifestTable.imageId,
			indexId: manifestTable.indexId,
			digest: manifestTable.digest,
			schemaVersion: manifestTable.schemaVersion,
			mediaType: manifestTable.mediaType,
			annotations: manifestTable.annotations,
			createdAt: manifestTable.createdAt
		})
		.from(manifestTable)
		.where(and(eq(manifestTable.id, manifestId), eq(manifestTable.imageId, imageId)))
		.limit(1);

	return rows[0] ?? null;
});
