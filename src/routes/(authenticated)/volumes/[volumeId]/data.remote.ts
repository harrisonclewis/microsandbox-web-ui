import { getRequestEvent, query } from '$app/server';
import { eq } from 'drizzle-orm';
import { db, volumeTable } from '$lib/server/db';
import { parseIntParam } from '$lib/server/route-params';

export const getVolumeDetail = query(async () => {
	const volumeId = parseIntParam(getRequestEvent().params.volumeId, 'volumeId');

	const rows = await db
		.select({
			id: volumeTable.id,
			name: volumeTable.name,
			quotaMib: volumeTable.quotaMib,
			sizeBytes: volumeTable.sizeBytes,
			labels: volumeTable.labels,
			createdAt: volumeTable.createdAt,
			updatedAt: volumeTable.updatedAt
		})
		.from(volumeTable)
		.where(eq(volumeTable.id, volumeId))
		.limit(1);

	return rows[0] ?? null;
});
