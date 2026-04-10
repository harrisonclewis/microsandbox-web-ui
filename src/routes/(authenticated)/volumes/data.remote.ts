import { query } from '$app/server';
import { asc } from 'drizzle-orm';
import { db, volumeTable } from '$lib/server/db';

export const getVolumes = query(async () => {
	return db
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
		.orderBy(asc(volumeTable.name), asc(volumeTable.id));
});
