import { query } from '$app/server';
import { asc } from 'drizzle-orm';
import { db, imageTable } from '$lib/server/db';

export const getImages = query(async () => {
	return db
		.select({
			id: imageTable.id,
			reference: imageTable.reference,
			sizeBytes: imageTable.sizeBytes,
			lastUsedAt: imageTable.lastUsedAt,
			createdAt: imageTable.createdAt
		})
		.from(imageTable)
		.orderBy(asc(imageTable.reference), asc(imageTable.id));
});
